<template>
  <div id="app" class="center" :style="gradient">
    <div class="center-item" :style="{color: fontColor}">
      <div>{{dateString}}</div>
      <div class="monospace">{{timeString}}</div>
    </div>
    
  </div>
</template>

<script>
var months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
var days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

import Background from "@/components/Background";

export default {
  name: 'App',
  components: {
    Background,
  },
  data() {
    return {
     fontColor: "#fff",
     color: "#000",
     color2: '#fff',
     int: 0,
    }
  },
  computed: { 
    gradient() {
      return {
        background: `linear-gradient( 180deg, ${this.color}, ${this.color2})`
      }
    },
    dateString() {
      this.color;

      var d = new Date();
      var day = days[d.getDay()];
      var date = d.getDate();
      var month = months[d.getMonth()];
      var year = d.getFullYear();

      return `${day} ${month} ${date} ${year}`
    },
    timeString() {
      this.color;
      var d = new Date();
      var hr = d.getHours();
      var min = d.getMinutes();
      if (min < 10) {
          min = "0" + min;
      }
      var ampm = "am";
      if( hr > 12 ) {
          hr -= 12;
          ampm = "pm";
      }
      if(hr == 0) {
        hr = 12
      }
      let sec = d.getSeconds();
      if(sec < 10) {
        sec = "0"+ sec;
      }
      return `${hr}:${min}:${sec} ${ampm}`
    }
  },
  methods: {
    updateColor() {
      let today = new Date();
      let hue = this.getHue(today, .65);
      let hue2 = this.getHue(today, .75);
      this.color = `hsla(${hue}, 90%, 35%, 1)`
      this.color2 = `hsla(${hue2}, 90%, 35%, 1)`

      this.fontColor = `hsl(${hue}, 100%, 70%)`

      this.int = setTimeout(this.updateColor, 1000)
    },
    getHue(d, offset = 0.65) {
        let percent =  offset + ((d.getHours() * 3600 + d.getMinutes() * 60 + d.getSeconds()) / 86400);
        percent = percent - Math.floor(percent)
        return 360 * percent;
    },
  },
  created() {
    this.updateColor();
  },
  destroyed() {
    clearInterval(this.int)
  }
}
</script>

<style>
body {
  background-color: black;
}
.center {
  display: flex;
  align-items: center;
  justify-content: center;
  /* background-color: black; */
}

.monospace {
  font-family: 'Roboto Mono', monospace;
}

.center-item {
  text-align: center;
  font-size: 6em;
  font-family: monospace;
  font-family: 'Quicksand', sans-serif;
}

html, body {
  margin: 0;
  padding: 0;
}
#app {
  width: 100%;
  height: 100%;
  position: absolute;
}
</style>
