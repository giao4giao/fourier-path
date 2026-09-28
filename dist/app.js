const $ = (s, root=document) => root.querySelector(s);
const $$ = (s, root=document) => [...root.querySelectorAll(s)];
const COLORS = { bg:'#1b3031', grid:'#334a49', cyan:'#a1d4b8', amber:'#e8b57b', muted:'#afc1b8', ink:'#eff2e9', red:'#d98b74' };

function setupCanvas(canvas){
  const dpr=Math.min(window.devicePixelRatio||1,2), rect=canvas.getBoundingClientRect();
  const w=Math.max(1,rect.width), h=w*(canvas.height/canvas.width);
  canvas.width=w*dpr; canvas.height=h*dpr; canvas.style.height=h+'px';
  const ctx=canvas.getContext('2d'); ctx.setTransform(dpr,0,0,dpr,0,0); return {ctx,w,h};
}
function grid(ctx,w,h,split){ctx.strokeStyle=COLORS.grid;ctx.lineWidth=1;for(let x=0;x<w;x+=w/8){ctx.beginPath();ctx.moveTo(x,0);ctx.lineTo(x,h);ctx.stroke()}for(let y=0;y<h;y+=h/6){ctx.beginPath();ctx.moveTo(0,y);ctx.lineTo(w,y);ctx.stroke()}if(split){ctx.strokeStyle='#365069';ctx.beginPath();ctx.moveTo(0,split);ctx.lineTo(w,split);ctx.stroke()}}
function line(ctx,points,color,width=2){ctx.beginPath();points.forEach((p,i)=>i?ctx.lineTo(p[0],p[1]):ctx.moveTo(p[0],p[1]));ctx.strokeStyle=color;ctx.lineWidth=width;ctx.stroke()}

const heroInputs=['f1','a1','f2','a2'].map(id=>$('#'+id));
function drawHero(){const c=$('#heroCanvas'),{ctx,w,h}=setupCanvas(c);ctx.fillStyle=COLORS.bg;ctx.fillRect(0,0,w,h);const split=h*.58;grid(ctx,w,h,split);const f1=+$('#f1').value,a1=+$('#a1').value,f2=+$('#f2').value,a2=+$('#a2').value;$('#f1Out').value=f1+' Hz';$('#a1Out').value=a1.toFixed(1);$('#f2Out').value=f2+' Hz';$('#a2Out').value=a2.toFixed(1);const amp=split*.28/Math.max(.5,a1+a2);let pts=[];for(let x=0;x<=w;x+=2){const t=x/w;pts.push([x,split*.48-amp*(a1*Math.sin(2*Math.PI*f1*t)+a2*Math.sin(2*Math.PI*f2*t))])}line(ctx,pts,COLORS.cyan,2.2);ctx.fillStyle=COLORS.muted;ctx.font='12px system-ui';ctx.fillText('时域：x(t)',12,20);ctx.fillText('频域：|X(f)|',12,split+20);ctx.strokeStyle=COLORS.amber;ctx.fillStyle=COLORS.amber;const peaks=new Map();[[f1,a1],[f2,a2]].forEach(([f,a])=>peaks.set(f,(peaks.get(f)||0)+a));peaks.forEach((a,f)=>{if(a===0)return;const x=34+(f/10)*(w-60),base=h-28,top=base-a*(h-split-55)/3;ctx.lineWidth=5;ctx.beginPath();ctx.moveTo(x,base);ctx.lineTo(x,top);ctx.stroke();ctx.font='11px system-ui';ctx.fillText(f+' Hz',x-12,base+17)});}
heroInputs.forEach(i=>i.addEventListener('input',drawHero));$('#randomSignal').addEventListener('click',()=>{ $('#f1').value=1+Math.floor(Math.random()*5);$('#f2').value=6+Math.floor(Math.random()*5);$('#a1').value=(.5+Math.random()).toFixed(1);$('#a2').value=(.2+Math.random()).toFixed(1);drawHero()});

function drawPhase(){const c=$('#phaseWaveCanvas'),{ctx,w,h}=setupCanvas(c),deg=+$('#phase').value,phi=deg*Math.PI/180;ctx.fillStyle=COLORS.bg;ctx.fillRect(0,0,w,h);grid(ctx,w,h);let base=[],shift=[];for(let x=0;x<=w;x+=2){const t=x/w*2;base.push([x,h/2-Math.sin(2*Math.PI*t)*h*.28]);shift.push([x,h/2-Math.sin(2*Math.PI*t+phi)*h*.28])}line(ctx,base,'#3b596b',1.5);line(ctx,shift,COLORS.cyan,2.5);$('#phaseOut').value=deg+'°';const msg=deg===0?'0°：波从零点向上出发。':deg===90?'90°：正弦波变成余弦波。':deg===-90?'−90°：波从最低点开始。':(deg>0?'正相位：波形相对向左移动。':'负相位：波形相对向右移动。');$('#phaseInsight').textContent=msg}
$('#phase').addEventListener('input',drawPhase);

function quadrant(d){if(d===0||d===360)return '正实轴';if(d===90)return '正虚轴';if(d===180)return '负实轴';if(d===270)return '负虚轴';return '象限'+'ⅠⅡⅢⅣ'[Math.floor((d%360)/90)]}
function drawComplex(){const c=$('#complexCanvas'),{ctx,w,h}=setupCanvas(c),d=+$('#angle').value,a=d*Math.PI/180,cx=w/2,cy=h/2,r=Math.min(w,h)*.34,x=cx+r*Math.cos(a),y=cy-r*Math.sin(a);ctx.fillStyle=COLORS.bg;ctx.fillRect(0,0,w,h);ctx.strokeStyle=COLORS.grid;ctx.lineWidth=1;ctx.beginPath();ctx.arc(cx,cy,r,0,Math.PI*2);ctx.stroke();ctx.strokeStyle='#4b6578';ctx.beginPath();ctx.moveTo(20,cy);ctx.lineTo(w-20,cy);ctx.moveTo(cx,20);ctx.lineTo(cx,h-20);ctx.stroke();ctx.setLineDash([5,5]);ctx.strokeStyle='#426575';ctx.beginPath();ctx.moveTo(x,cy);ctx.lineTo(x,y);ctx.lineTo(cx,y);ctx.stroke();ctx.setLineDash([]);line(ctx,[[cx,cy],[x,y]],COLORS.cyan,3);ctx.fillStyle=COLORS.amber;ctx.beginPath();ctx.arc(x,y,6,0,Math.PI*2);ctx.fill();ctx.fillStyle=COLORS.muted;ctx.font='12px system-ui';ctx.fillText('实轴',w-45,cy-8);ctx.fillText('虚轴',cx+8,20);const real=Math.cos(a),imag=Math.sin(a);$('#angleOut').value=d+'° · '+quadrant(d);$('#realOut').textContent=real.toFixed(3);$('#imagOut').textContent=imag.toFixed(3)}
$('#angle').addEventListener('input',drawComplex);

function drawSeries(){const c=$('#seriesCanvas'),{ctx,w,h}=setupCanvas(c),n=+$('#harmonics').value;ctx.fillStyle=COLORS.bg;ctx.fillRect(0,0,w,h);grid(ctx,w,h);let approx=[],ideal=[];for(let x=0;x<=w;x+=2){const t=x/w*2-1;let s=0;for(let k=0;k<n;k++){const odd=2*k+1;s+=(4/Math.PI)*Math.sin(odd*Math.PI*t)/odd}approx.push([x,h/2-s*h*.26]);ideal.push([x,h/2-(Math.sin(Math.PI*t)>=0?1:-1)*h*.26])}line(ctx,ideal,'#39566a',1.5);line(ctx,approx,COLORS.amber,2.2);$('#harmonicOut').value=n+' 个奇次谐波'}
$('#harmonics').addEventListener('input',drawSeries);

function aliasFrequency(f,fs){return ((f+fs/2)%fs+fs)%fs-fs/2}
function drawAlias(){const c=$('#aliasCanvas'),{ctx,w,h}=setupCanvas(c),f=+$('#signalFreq').value,fs=+$('#sampleRate').value,signedAlias=aliasFrequency(f,fs),af=Math.abs(signedAlias);ctx.fillStyle=COLORS.bg;ctx.fillRect(0,0,w,h);grid(ctx,w,h);let wave=[],alias=[];for(let x=0;x<=w;x+=2){const t=x/w;wave.push([x,h/2-Math.sin(2*Math.PI*f*t)*h*.28]);alias.push([x,h/2-Math.sin(2*Math.PI*signedAlias*t)*h*.28])}line(ctx,wave,'#315167',1.2);line(ctx,alias,COLORS.amber,1.8);ctx.fillStyle=COLORS.cyan;for(let n=0;n<=fs;n++){const t=n/fs,x=t*w,y=h/2-Math.sin(2*Math.PI*f*t)*h*.28;ctx.beginPath();ctx.arc(x,y,3.5,0,Math.PI*2);ctx.fill()}$('#signalFreqOut').value=f+' Hz';$('#sampleRateOut').value=fs+' Hz';$('#aliasOut').value=f<fs/2?`真实 ${f} Hz → 正确识别`:`真实 ${f} Hz → 看似 ${af} Hz${signedAlias<0?'（相位反转）':''}`}
$('#signalFreq').addEventListener('input',drawAlias);$('#sampleRate').addEventListener('input',drawAlias);

const windowNames={rect:'矩形窗',hann:'Hann 窗',blackman:'Blackman 窗'};let currentWindow='rect';
function windowValue(type,t){if(type==='hann')return .5-.5*Math.cos(2*Math.PI*t);if(type==='blackman')return .42-.5*Math.cos(2*Math.PI*t)+.08*Math.cos(4*Math.PI*t);return 1}
function windowResponse(type,offset){const count=64;let real=0,imag=0,total=0;for(let n=0;n<count;n++){const weight=windowValue(type,n/count),angle=2*Math.PI*offset*n/count;real+=weight*Math.cos(angle);imag-=weight*Math.sin(angle);total+=weight}return Math.hypot(real,imag)/total}
function drawWindow(){const c=$('#windowCanvas'),{ctx,w,h}=setupCanvas(c),split=h*.52;ctx.fillStyle=COLORS.bg;ctx.fillRect(0,0,w,h);grid(ctx,w,h,split);let pts=[];for(let x=0;x<=w;x+=2)pts.push([x,split*.85-windowValue(currentWindow,x/w)*split*.62]);line(ctx,pts,COLORS.cyan,2.2);const top=split+30,bottom=h-25,span=bottom-top,response=[];for(let x=0;x<=w;x+=2){const offset=(x/w-.5)*16,db=20*Math.log10(Math.max(windowResponse(currentWindow,offset),1e-5));response.push([x,top+Math.min(90,-db)/90*span])}line(ctx,response,COLORS.amber,2);ctx.fillStyle=COLORS.muted;ctx.font='12px system-ui';ctx.fillText('时域窗口',12,18);ctx.fillText('频域响应（归一化 dB）',12,split+20);ctx.fillText('0 dB',w/2+8,top+12);ctx.fillText('−90 dB',12,bottom-4);$('#windowOut').value=windowNames[currentWindow]}
$$('.window-card').forEach(b=>b.addEventListener('click',()=>{currentWindow=b.dataset.window;$$('.window-card').forEach(x=>x.classList.toggle('active',x===b));drawWindow()}));

const quizFeedback={
  phase:{answer:'no',correct:'正确。相位改变频谱相位，不会移动幅度谱峰值。',wrong:'相位改变起点；频率决定每秒重复次数。'},
  quadrant:{answer:'real',correct:'正确。120° 在第二象限，cos120° 为负。',wrong:'第二象限的横坐标为负，纵坐标为正。'},
  harmonics:{answer:'zero',correct:'正确。对称方波只有奇次谐波。',wrong:'观察方波半波对称性：偶次谐波的贡献会相互抵消。'},
  pulse:{answer:'wide',correct:'正确。时间越集中，通常需要越宽的频率范围来合成。',wrong:'对矩形脉冲，第一频域零点在 1/τ；τ 越小，零点越远。'},
  padding:{answer:'no',correct:'正确。补零使频谱显示更细密，没有增加真实采样时长。',wrong:'补上的零并非新测量值；T 只由真实样本数和采样率决定。'},
  alias:{answer:'no',correct:'正确。17 Hz 与相位反转的 3 Hz 在这些采样时刻完全一致。',wrong:'若两种连续信号给出相同样本，样本本身无法区分它们。'},
  window:{answer:'blackman',correct:'正确。Blackman 旁瓣低，但主瓣也更宽。',wrong:'矩形窗主瓣较窄，但旁瓣比 Blackman 高。'},
  stft:{answer:'stft',correct:'正确。分段分析才能看到频率随时间怎样变化。',wrong:'整段 FFT 汇总了整个记录，无法指出变化发生的时刻。'}
};
$$('[data-quiz]').forEach(group=>{$$('button',group).forEach(b=>b.setAttribute('aria-pressed','false'));group.addEventListener('click',e=>{const btn=e.target.closest('button');if(!btn||!group.contains(btn))return;const feedback=quizFeedback[group.dataset.quiz],ok=btn.dataset.answer===feedback.answer;$$('button',group).forEach(b=>{b.classList.remove('correct','wrong');b.setAttribute('aria-pressed',String(b===btn))});btn.classList.add(ok?'correct':'wrong');group.parentElement.querySelector('.feedback').textContent=ok?feedback.correct:feedback.wrong})});
$('#revealNyquist').addEventListener('click',()=>{const d=$('#nyquistExplain');d.hidden=!d.hidden;$('#revealNyquist').textContent=d.hidden?'显示解释':'收起解释'});

const STORE='fourier-path-progress-v1';
function loadProgress(){try{const saved=JSON.parse(localStorage.getItem(STORE)||'[]');return new Set(Array.isArray(saved)?saved.filter(n=>Number.isInteger(n)&&n>=1&&n<=8):[])}catch{return new Set()}}
let completed=loadProgress();
function saveProgress(){try{localStorage.setItem(STORE,JSON.stringify([...completed]))}catch{ /* Private browsing may disable storage; the current session still works. */ }renderProgress()}
function renderProgress(){const n=completed.size;$('#progressText').textContent=n+' / 8';$('#progressBar').style.width=(n/8*100)+'%';$$('[data-complete]').forEach(b=>{const done=completed.has(+b.dataset.complete);b.classList.toggle('done',done);b.setAttribute('aria-pressed',String(done));b.textContent=done?'✓ 已完成，点击撤销':(+b.dataset.complete===8?'完成大师路径':'完成第'+['零','一','二','三','四','五','六','七'][+b.dataset.complete]+'阶段')});$$('#courseNav a').forEach(a=>a.classList.toggle('done',completed.has(+a.dataset.module)))}
$$('[data-complete]').forEach(b=>b.addEventListener('click',()=>{const n=+b.dataset.complete;completed.has(n)?completed.delete(n):completed.add(n);saveProgress()}));
$('#resetProgress').addEventListener('click',()=>{if(confirm('确定清除全部学习进度吗？')){completed.clear();saveProgress()}});

const sidebar=$('.sidebar'),scrim=$('#scrim');function setMenu(open){sidebar.classList.toggle('open',open);scrim.classList.toggle('open',open);$('#menuBtn').setAttribute('aria-expanded',String(open));$('#menuBtn').setAttribute('aria-label',open?'关闭课程目录':'打开课程目录')}$('#menuBtn').addEventListener('click',()=>setMenu(!sidebar.classList.contains('open')));scrim.addEventListener('click',()=>setMenu(false));$$('#courseNav a').forEach(a=>a.addEventListener('click',()=>setMenu(false)));document.addEventListener('keydown',e=>{if(e.key==='Escape'&&sidebar.classList.contains('open')){setMenu(false);$('#menuBtn').focus()}});
const sections=$$('[data-lesson]');const observer=new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting){$$('#courseNav a').forEach(a=>a.classList.toggle('active',a.dataset.module===e.target.dataset.lesson))}}),{rootMargin:'-30% 0px -60%'});sections.forEach(s=>observer.observe(s));

function registerWebMCP(){const mc=document.modelContext;if(!mc?.registerTool)return;const safeN=x=>{const n=Number(x);if(!Number.isInteger(n)||n<1||n>8)throw new Error('module 必须是 1 到 8 的整数');return n};try{mc.registerTool({name:'get_learning_progress',title:'读取学习进度',description:'读取傅里叶课程已完成阶段和总体进度。',inputSchema:{type:'object',properties:{},additionalProperties:false},annotations:{readOnlyHint:true,untrustedContentHint:false},execute:()=>({completed:[...completed].sort(),total:8,percent:completed.size/8*100})});mc.registerTool({name:'mark_module_complete',title:'标记课程阶段完成',description:'把指定傅里叶学习阶段标记为已完成，并同步更新页面进度。',inputSchema:{type:'object',properties:{module:{type:'integer',minimum:1,maximum:8}},required:['module'],additionalProperties:false},annotations:{readOnlyHint:false,untrustedContentHint:false},execute:input=>{const n=safeN(input?.module);completed.add(n);saveProgress();return{module:n,completed:true,totalCompleted:completed.size}}});mc.registerTool({name:'open_learning_module',title:'打开课程阶段',description:'滚动到指定傅里叶学习阶段。',inputSchema:{type:'object',properties:{module:{type:'integer',minimum:1,maximum:8}},required:['module'],additionalProperties:false},annotations:{readOnlyHint:false,untrustedContentHint:false},execute:input=>{const n=safeN(input?.module);document.querySelector(`[data-lesson="${n}"]`).scrollIntoView({behavior:'smooth'});return{module:n,opened:true}}})}catch(e){console.warn('WebMCP unavailable',e)}}

function redrawAll(){drawHero();drawPhase();drawComplex();drawSeries();drawAlias();drawWindow()}
let resizeTimer;window.addEventListener('resize',()=>{clearTimeout(resizeTimer);resizeTimer=setTimeout(redrawAll,120)});renderProgress();redrawAll();registerWebMCP();
