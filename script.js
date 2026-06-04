(function() {
  var STIMULI = { tala: ['*','~'], pebble: ['**','~~','*~','~*'] };
  var state = { tala: { count: 20, trials: [] }, pebble: { count: 20, trials: [] } };
  var dateStr = new Date().toLocaleDateString('en-US', { weekday:'long', year:'numeric', month:'long', day:'numeric' });
  document.getElementById('hdr-date').textContent = dateStr;

  document.getElementById('tab-tala').addEventListener('click', function() {
    document.getElementById('tab-tala').classList.add('active'); document.getElementById('tab-pebble').classList.remove('active');
    document.getElementById('panel-tala').classList.add('active'); document.getElementById('panel-pebble').classList.remove('active');
  });
  document.getElementById('tab-pebble').addEventListener('click', function() {
    document.getElementById('tab-pebble').classList.add('active'); document.getElementById('tab-tala').classList.remove('active');
    document.getElementById('panel-pebble').classList.add('active'); document.getElementById('panel-tala').classList.remove('active');
  });

  function wireCount(bird, n) {
    document.getElementById(bird+'-c'+n).addEventListener('click', function() {
      state[bird].count = n;
      ['20','40','60'].forEach(function(v) { document.getElementById(bird+'-c'+v).classList.remove('active'); });
      document.getElementById(bird+'-c'+n).classList.add('active');
    });
  }
  wireCount('tala',20); wireCount('tala',40); wireCount('tala',60);
  wireCount('pebble',20); wireCount('pebble',40); wireCount('pebble',60);

  function generate(bird) {
    var stims = STIMULI[bird], total = state[bird].count, pool = [];
    var base = Math.floor(total/stims.length), rem = total%stims.length;
    for (var i=0; i<stims.length; i++) { var n=base+(i<rem?1:0); for (var k=0;k<n;k++) pool.push({stim:stims[i],choice:null,ok:null}); }
    for (var i=pool.length-1; i>0; i--) { var j=Math.floor(Math.random()*(i+1)); var t=pool[i]; pool[i]=pool[j]; pool[j]=t; }
    state[bird].trials = pool;
    document.getElementById(bird+'-date').textContent = dateStr;
    document.getElementById(bird+'-trials').classList.add('on');
    renderList(bird); updateScore(bird);
  }
  document.getElementById('tala-gen').addEventListener('click', function() { generate('tala'); });
  document.getElementById('pebble-gen').addEventListener('click', function() { generate('pebble'); });

  function renderList(bird) {
    var list = document.getElementById(bird+'-list'), trials = state[bird].trials, stims = STIMULI[bird];
    list.innerHTML = '';
    for (var i=0; i<trials.length; i++) {
      (function(idx) {
        var t = trials[idx], row = document.createElement('div');
        row.className = 'trial-row'+(t.ok===true?' correct':t.ok===false?' wrong':'');
        row.id = bird+'-row-'+idx;
        var num = document.createElement('span'); num.className='t-num'; num.textContent='#'+(idx+1);
        var stim = document.createElement('span'); stim.className='t-stim'; stim.textContent=t.stim;
        var choices = document.createElement('div'); choices.className='t-choices';
        for (var si=0; si<stims.length; si++) {
          (function(s) {
            var btn = document.createElement('button');
            btn.className = 'choice-btn'+(t.choice===s?(t.ok?' picked-right':' picked-wrong'):'');
            btn.textContent = s;
            btn.addEventListener('click', function() { pick(bird,idx,s); });
            choices.appendChild(btn);
          })(stims[si]);
        }
        var icon = document.createElement('span'); icon.className='t-icon'; icon.textContent=t.ok===true?'\u2705':t.ok===false?'\u274C':'';
        row.appendChild(num); row.appendChild(stim); row.appendChild(choices); row.appendChild(icon);
        list.appendChild(row);
      })(i);
    }
  }

  function pick(bird, idx, choice) {
    var t = state[bird].trials[idx]; t.choice=choice; t.ok=(choice===t.stim);
    var row = document.getElementById(bird+'-row-'+idx);
    row.className = 'trial-row '+(t.ok?'correct':'wrong');
    var stims=STIMULI[bird], choices=row.querySelector('.t-choices');
    choices.innerHTML='';
    for (var si=0; si<stims.length; si++) {
      (function(s) {
        var btn=document.createElement('button');
        btn.className='choice-btn'+(t.choice===s?(t.ok?' picked-right':' picked-wrong'):'');
        btn.textContent=s;
        btn.addEventListener('click', function() { pick(bird,idx,s); });
        choices.appendChild(btn);
      })(stims[si]);
    }
    row.querySelector('.t-icon').textContent=t.ok?'\u2705':'\u274C';
    updateScore(bird);
  }

  function updateScore(bird) {
    var trials=state[bird].trials, answered=0, correct=0;
    for (var i=0;i<trials.length;i++) { if(trials[i].ok!==null) answered++; if(trials[i].ok===true) correct++; }
    var pct=answered>0?Math.round(correct/answered*100):null;
    document.getElementById(bird+'-pct').textContent=pct!==null?pct+'%':'--';
    document.getElementById(bird+'-info').textContent=answered>0?correct+' correct of '+answered+' answered \u00b7 '+trials.length+' total':'No trials answered yet';
    document.getElementById(bird+'-fill').style.width=(pct||0)+'%';
  }

  function doReset(bird) {
    state[bird].trials=[];
    document.getElementById(bird+'-trials').classList.remove('on');
    document.getElementById(bird+'-list').innerHTML='';
    document.getElementById(bird+'-pct').textContent='--';
    document.getElementById(bird+'-info').textContent='No trials answered yet';
    document.getElementById(bird+'-fill').style.width='0%';
  }
  document.getElementById('tala-reset').addEventListener('click', function() { doReset('tala'); });
  document.getElementById('pebble-reset').addEventListener('click', function() { doReset('pebble'); });

  function doPrint(bird) {
    var name=bird==='tala'?'Tala':'Pebble', mode=bird==='tala'?'Singles (* | ~)':'Pairs (** | ~~ | *~ | ~*)';
    var trials=state[bird].trials, answered=0, correct=0;
    for (var i=0;i<trials.length;i++) { if(trials[i].ok!==null) answered++; if(trials[i].ok===true) correct++; }
    var pct=answered>0?Math.round(correct/answered*100):0, rows='';
    for (var i=0;i<trials.length;i++) {
      var t=trials[i], cls=t.ok===true?'pr-cor':t.ok===false?'pr-wrg':'', res=t.ok===true?'Correct':t.ok===false?'Wrong':'--';
      rows+='<tr class="'+cls+'"><td>'+(i+1)+'</td><td>'+t.stim+'</td><td>'+(t.choice||'--')+'</td><td>'+res+'</td></tr>';
    }
    document.getElementById('print-area').innerHTML='<h1>'+name+' - Training Results</h1><div class="sub">'+dateStr+' &middot; '+trials.length+' trials &middot; '+mode+'</div><div class="sum"><div class="sum-pct">'+pct+'%</div><div class="sum-info"><strong>'+correct+'</strong> correct of <strong>'+answered+'</strong> answered<br>'+(trials.length-answered)+' unanswered</div></div><table><thead><tr><th>#</th><th>Stimulus</th><th>Choice</th><th>Result</th></tr></thead><tbody>'+rows+'</tbody></table>';
    window.print();
  }
  document.getElementById('tala-print').addEventListener('click', function() { doPrint('tala'); });
  document.getElementById('pebble-print').addEventListener('click', function() { doPrint('pebble'); });
})();
