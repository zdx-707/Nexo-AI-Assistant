window.SoundEffects = {
  register: function(audio) {
    audio.register('explosion', function(ctx, opts) {
      var duration = 0.8;
      var sampleRate = ctx.sampleRate;
      var bufferSize = Math.floor(sampleRate * duration);
      var buffer = ctx.createBuffer(1, bufferSize, sampleRate);
      var data = buffer.getChannelData(0);
      for (var i = 0; i < bufferSize; i++) {
        data[i] = Math.random() * 2 - 1;
      }

      var noiseSource = ctx.createBufferSource();
      noiseSource.buffer = buffer;

      var noiseFilter = ctx.createBiquadFilter();
      noiseFilter.type = 'bandpass';
      noiseFilter.frequency.value = 400;
      noiseFilter.Q.value = 0.8;

      var noiseGain = ctx.createGain();
      noiseGain.gain.setValueAtTime(1.0, ctx.currentTime);
      noiseGain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);

      noiseSource.connect(noiseFilter);
      noiseFilter.connect(noiseGain);
      noiseGain.connect(ctx.destination);
      noiseSource.start(ctx.currentTime);
      noiseSource.stop(ctx.currentTime + duration);

      var boomOsc = ctx.createOscillator();
      boomOsc.type = 'sine';
      boomOsc.frequency.setValueAtTime(40, ctx.currentTime);
      boomOsc.frequency.exponentialRampToValueAtTime(20, ctx.currentTime + 0.3);

      var boomGain = ctx.createGain();
      boomGain.gain.setValueAtTime(1.5, ctx.currentTime);
      boomGain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3);

      boomOsc.connect(boomGain);
      boomGain.connect(ctx.destination);
      boomOsc.start(ctx.currentTime);
      boomOsc.stop(ctx.currentTime + 0.3);
    });

    audio.register('sticker_place', function(ctx) {
      var osc = ctx.createOscillator();
      osc.type = 'sine';
      osc.frequency.value = 1200;

      var gain = ctx.createGain();
      gain.gain.setValueAtTime(0.4, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.05);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.05);
    });

    audio.register('drone_hum', function(ctx) {
      var osc = ctx.createOscillator();
      osc.type = 'sawtooth';
      osc.frequency.value = 120;

      var lfo = ctx.createOscillator();
      lfo.type = 'sine';
      lfo.frequency.value = 8;

      var lfoGain = ctx.createGain();
      lfoGain.gain.value = 5;

      lfo.connect(lfoGain);
      lfoGain.connect(osc.frequency);

      var gain = ctx.createGain();
      gain.gain.value = 0.3;

      osc.connect(gain);
      gain.connect(ctx.destination);

      lfo.start();

      return osc;
    });

    audio.register('alarm', function(ctx) {
      var cycles = 3;
      var stepDuration = 0.25;

      for (var i = 0; i < cycles; i++) {
        (function(cycle) {
          var highOsc = ctx.createOscillator();
          highOsc.type = 'square';
          highOsc.frequency.value = 800;

          var highGain = ctx.createGain();
          highGain.gain.value = 0.4;

          highOsc.connect(highGain);
          highGain.connect(ctx.destination);

          var highStart = ctx.currentTime + cycle * stepDuration * 2;
          highOsc.start(highStart);
          highOsc.stop(highStart + stepDuration);

          var lowOsc = ctx.createOscillator();
          lowOsc.type = 'square';
          lowOsc.frequency.value = 600;

          var lowGain = ctx.createGain();
          lowGain.gain.value = 0.4;

          lowOsc.connect(lowGain);
          lowGain.connect(ctx.destination);

          var lowStart = highStart + stepDuration;
          lowOsc.start(lowStart);
          lowOsc.stop(lowStart + stepDuration);
        })(i);
      }
    });

    audio.register('alarm_loud', function(ctx) {
      var pulses = 4;
      var onTime = 0.1;
      var offTime = 0.1;

      for (var i = 0; i < pulses; i++) {
        (function(pulse) {
          var osc = ctx.createOscillator();
          osc.type = 'square';
          osc.frequency.value = 1000;

          var gain = ctx.createGain();
          gain.gain.value = 0.8;

          osc.connect(gain);
          gain.connect(ctx.destination);

          var start = ctx.currentTime + pulse * (onTime + offTime);
          osc.start(start);
          osc.stop(start + onTime);
        })(i);
      }
    });

    audio.register('alert_beep', function(ctx) {
      var osc = ctx.createOscillator();
      osc.type = 'sine';
      osc.frequency.value = 900;

      var gain = ctx.createGain();
      gain.gain.setValueAtTime(0.5, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.1);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.1);
    });

    audio.register('pickup', function(ctx) {
      var notes = [523.25, 659.25, 783.99];
      var stepDuration = 0.1;

      for (var i = 0; i < notes.length; i++) {
        (function(index, freq) {
          var osc = ctx.createOscillator();
          osc.type = 'sine';
          osc.frequency.value = freq;

          var gain = ctx.createGain();
          var start = ctx.currentTime + index * stepDuration;
          gain.gain.setValueAtTime(0.5, start);
          gain.gain.exponentialRampToValueAtTime(0.001, start + stepDuration);

          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start(start);
          osc.stop(start + stepDuration);
        })(i, notes[i]);
      }
    });

    audio.register('footstep', function(ctx) {
      var osc = ctx.createOscillator();
      osc.type = 'sine';
      osc.frequency.value = 60;

      var gain = ctx.createGain();
      gain.gain.setValueAtTime(0.6, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.05);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.05);
    });

    audio.register('mission_complete', function(ctx) {
      var notes = [392.00, 493.88, 587.33, 783.99];
      var stepDuration = 0.15;

      for (var i = 0; i < notes.length; i++) {
        (function(index, freq) {
          var osc = ctx.createOscillator();
          osc.type = 'sine';
          osc.frequency.value = freq;

          var gain = ctx.createGain();
          var start = ctx.currentTime + index * stepDuration;
          var hold = (index === notes.length - 1) ? 0.4 : stepDuration;
          gain.gain.setValueAtTime(0.5, start);
          gain.gain.exponentialRampToValueAtTime(0.001, start + hold);

          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start(start);
          osc.stop(start + hold);
        })(i, notes[i]);
      }
    });
  }
};
