const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const root = path.join(__dirname, '..');
const source = fs.readFileSync(path.join(root, 'assets/trailer.js'), 'utf8');

function fixture(reduced = false) {
  const node = extra => Object.assign({hidden:true,style:{},listeners:{},addEventListener(type,fn){this.listeners[type]=fn;}},extra);
  const video = node({paused:true,muted:true,currentTime:12,plays:0,
    play(){this.paused=false;this.plays++;this.listeners.play?.();return Promise.resolve();},
    pause(){if(!this.paused){this.paused=true;this.listeners.pause?.();}}
  });
  const nodes = {missionTrailer:video,trailerStage:node({getBoundingClientRect:()=>({top:500})}),trailerFrame:node(),trailerWatch:node(),trailerError:node()};
  const motion = node({matches:reduced});
  let intersect, mutation, blocked=false;
  const document = node({hidden:false,getElementById:id=>nodes[id],querySelector:()=>blocked ? {} : null,querySelectorAll:()=>[{}]});
  vm.runInNewContext(source,{
    document,innerHeight:1000,
    window:{matchMedia:query=>query.includes('reduced')?motion:node({matches:false}),addEventListener(){}},
    requestAnimationFrame:fn=>{fn();return 1;},
    IntersectionObserver:class{constructor(fn){intersect=fn;}observe(){}},
    MutationObserver:class{constructor(fn){mutation=fn;}observe(){}},
  });
  return {video,nodes,motion,document,visible(value){intersect([{isIntersecting:value,intersectionRatio:value?1:0}]);},block(value){blocked=value;mutation();}};
}

test('trailer never autoplays on entry or after closing a dialog',()=>{
  const f=fixture();assert.equal(f.video.plays,0);
  f.visible(true);assert.equal(f.video.paused,true);assert.equal(f.video.plays,0);
  f.nodes.trailerWatch.listeners.click();assert.equal(f.video.paused,false);
  f.block(true);assert.equal(f.video.paused,true);
  f.block(false);assert.equal(f.video.paused,true);
  f.document.hidden=true;f.document.listeners.visibilitychange();assert.equal(f.video.paused,true);
});

test('watch with sound starts at the beginning and explicit pause survives reentry',()=>{
  const f=fixture();f.visible(true);f.nodes.trailerWatch.listeners.click();
  assert.equal(f.video.currentTime,0);assert.equal(f.video.muted,false);assert.equal(f.nodes.trailerWatch.hidden,true);
  f.video.pause();f.visible(false);f.visible(true);assert.equal(f.video.paused,true);
});

test('reduced motion has no autoplay or scale animation but allows deliberate playback',()=>{
  const f=fixture(true);f.visible(true);
  assert.equal(f.video.plays,0);assert.equal(f.nodes.trailerFrame.style.transform,'scale(1)');
  f.nodes.trailerWatch.listeners.click();assert.equal(f.video.paused,false);
});

test('desktop reveal lifts and expands the trailer without enabling audio',()=>{
  const f=fixture();
  assert.match(f.nodes.trailerFrame.style.transform, /^translateY\([\d.]+px\) scale\(0\.[\d]+\)$/);
  assert.equal(f.video.muted,true);
});

test('offscreen pause requires another click and preserves playback position',()=>{
  const f=fixture();f.visible(true);f.nodes.trailerWatch.listeners.click();
  f.video.currentTime=25;f.visible(false);assert.equal(f.video.paused,true);
  f.visible(true);assert.equal(f.video.paused,true);
  f.nodes.trailerWatch.listeners.click();assert.equal(f.video.currentTime,25);
  f.video.pause();
  f.video.listeners.ended();f.visible(false);f.visible(true);assert.equal(f.video.paused,true);
  f.video.listeners.error();assert.equal(f.nodes.trailerError.hidden,false);
  f.block(false);assert.equal(f.video.paused,true);
});

test('finished trailer is linked without replacing the existing hero media',()=>{
  const home=fs.readFileSync(path.join(root,'index.html'),'utf8');
  assert.match(home,/id="missionTrailer"[^>]*preload="none"[^>]*controls/);
  assert.match(home,/src="assets\/trailer.js" defer/);
  assert(fs.statSync(path.join(root,'assets/video/gospel-advance-trailer.mp4')).size<100*1024*1024);
  assert(fs.statSync(path.join(root,'assets/video/gospel-advance-trailer.jpg')).size>0);
  const config=fs.readFileSync(path.join(root,'assets/media-config.js'),'utf8');
  assert.match(config,/heroPreview: 'assets\/video\/hero-campus-desktop.mp4'/);
});
test('Play requests fullscreen during the click and fullscreen ignores offscreen observations',()=>{
  const f=fixture();let requests=0;
  f.video.requestFullscreen=()=>{requests++;f.document.fullscreenElement=f.video;return Promise.resolve();};
  f.nodes.trailerWatch.listeners.click();
  assert.equal(requests,1);assert.equal(f.video.plays,1);
  f.visible(false);assert.equal(f.video.paused,false);
  f.document.fullscreenElement=null;f.document.listeners.fullscreenchange();
  assert.equal(f.video.paused,true);
});
test('Safari fullscreen and rejected requests preserve playback',async()=>{
  const safari=fixture();let requests=0;
  safari.video.webkitEnterFullscreen=()=>{requests++;};
  safari.nodes.trailerWatch.listeners.click();assert.equal(requests,1);
  const denied=fixture();
  denied.video.requestFullscreen=()=>Promise.reject(new Error('Denied'));
  denied.nodes.trailerWatch.listeners.click();
  await Promise.resolve();assert.equal(denied.video.paused,false);
});
