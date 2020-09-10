window.addEventListener("DOMContentLoaded", () => {
  let long;
  let lat;

  const tempDescription = document.getElementById("description");
  const tempDegree = document.getElementById("degree");
  const timezoneDisplay = document.getElementById("timezone");
  const tempSec = document.getElementById("temp-section");
  const tempSpan = document.getElementById("degreeSpan");
  const dailySummary = document.getElementById("daily-summary");
  const dailyBtn = document.getElementById("daily-btn");
  const currentForecast = document.getElementById("current-forecast");
  const dailyForecast = document.getElementById("daily-forecast");
  const currentBtn = document.getElementById("current-btn");
  const hourlyBtn = document.getElementById("hourly-btn");
  const hourlyForecast = document.getElementById("hourly-forecast");
  const timeCurrent = document.getElementById("currentTime");

  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition((position) => {
      long = position.coords.longitude;
      lat = position.coords.latitude;

      const proxy = "https://cors-anywhere.herokuapp.com/";
      const api = `${proxy}https://api.darksky.net/forecast/5c479ad8c04243ce1c8b1efb32c1d768/${lat},${long}?exclude=flags`;

      fetch(api)
        .then((response) => {
          return response.json();
        })
        .then((data) => {
          console.log(data);

          const {
            temperature,
            summary,
            icon,
            apparentTemperature,
            cloudCover,
            dewPoint,
            humidity,
            ozone,
            precipProbability,
            time,
            pressure,
            uvIndex,
            visibility,
            windSpeed,
            windBearing,
            windGust,
          } = data.currently;
          const dailySum = data.daily.summary;
          const timezone = data.timezone;

          data.daily.data.forEach((element, id) => {
            const {
              time,
              icon,
              temperatureHigh,
              temperatureLow,
              summary,
              precipProbability,
            } = element;

            showDaily(
              unixToDay(time),
              toCelsius(temperatureHigh),
              toCelsius(temperatureLow),
              summary,
              toPerc(precipProbability),
              id
            );
            setIcons(icon, `icons-${id}`);
          });

          data.hourly.data.forEach((element, id) => {
            const {
              icon,
              precipProbability,
              summary,
              temperature,
              time,
            } = element;

            showHourly(
              unixToHour(time),
              toCelsius(temperature),
              summary,
              toPerc(precipProbability),
              icon,
              id
            );

            setIcons(icon, `icon-${id}`);
          });

          tempDegree.innerHTML = `<strong>${toCelsius(temperature)}</strong> `;
          tempDescription.textContent = summary;
          timezoneDisplay.textContent = timezone;
          dailySummary.textContent = dailySum;
          timeCurrent.textContent = unixToTime(time);

          setIcons(icon, "icon");
          setIcons(icon, "icon1");

          changeUnitOnClick(temperature);

          setBasicInfo(
            toCelsius(apparentTemperature),
            windSpeed + " m/s",
            toPerc(precipProbability),
            uvIndex
          );

          showExtended(
            toPerc(cloudCover),
            toCelsius(dewPoint),
            toPerc(humidity),
            ozone,
            pressure + " hPa",
            visibility + " km",
            windBearing,
            windGust
          );
        });
    });

    hourlyForecast.style.display = "none";
    // currentForecast.style.display = "block";
    dailyForecast.style.display = "none";

    currentBtn.addEventListener("click", () => {
      if (hourlyBtn.classList.contains("active")) {
        hourlyBtn.classList.remove("active");
        currentBtn.classList.add("active");
        hourlyForecast.style.display = "none";
        currentForecast.style.display = "block";
      } else if (dailyBtn.classList.contains("active")) {
        currentBtn.classList.add("active");
        dailyBtn.classList.remove("active");
        dailyForecast.style.display = "none";
        currentForecast.style.display = "block";
      }
    });

    dailyBtn.addEventListener("click", () => {
      if (currentBtn.classList.contains("active")) {
        currentBtn.classList.remove("active");
        dailyBtn.classList.add("active");
        dailyForecast.style.display = "block";
        currentForecast.style.display = "none";
      } else if (hourlyBtn.classList.contains("active")) {
        hourlyBtn.classList.remove("active");
        dailyBtn.classList.add("active");
        hourlyForecast.style.display = "none";
        dailyForecast.style.display = "block";
      }
    });

    hourlyBtn.addEventListener("click", () => {
      if (currentBtn.classList.contains("active")) {
        currentBtn.classList.remove("active");
        hourlyBtn.classList.add("active");

        currentForecast.style.display = "none";
        hourlyForecast.style.display = "block";
      } else if (dailyBtn.classList.contains("active")) {
        dailyBtn.classList.remove("active");
        hourlyBtn.classList.add("active");
        dailyForecast.style.display = "none";
        hourlyForecast.style.display = "block";
      }
    });
  }

  function setIcons(icon, iconID) {
    const skycons = new Skycons({ color: "#ffc107" });
    const currentIcon = icon.replace(/-/g, "_").toUpperCase();

    skycons.play();
    return skycons.set(iconID, Skycons[currentIcon]);
  }

  function toPerc(par) {
    par = Math.floor(par * 100);
    return par + "%";
  }

  function toCelsius(temp) {
    let celsius = Math.floor((temp - 32) * (5 / 9)) + "°C";
    return celsius;
  }

  function changeUnitOnClick(temp) {
    tempSec.addEventListener("click", () => {
      if (tempSpan.textContent === "°C") {
        tempSpan.textContent = "°F";
        tempDegree.textContent = temp;
      } else {
        tempSpan.textContent = "°C";
        tempDegree.textContent = toCelsius(temp);
      }
    });
  }

  function setBasicInfo(f, w, pp, u) {
    const feels = document.getElementById("feelslike");
    const wind = document.getElementById("wind");
    const percip = document.getElementById("percip");
    const uv = document.getElementById("uv");

    feels.textContent = f;
    wind.textContent = w;
    percip.textContent = pp;
    uv.textContent = u;
    uv.style.borderRadius = "10px";
    percip.style.borderRadius = "10px";
    wind.style.borderRadius = "10px";
    feels.style.borderRadius = "10px";

    if (u < 3) {
      uv.style.backgroundColor = "lightgreen";
    } else if (u < 6) {
      uv.style.backgroundColor = "#ffdf5b";
    } else {
      uv.style.backgroundColor = "#ff7674";
    }
    if (parseInt(pp) < 20) {
      percip.style.backgroundColor = "lightgreen";
    } else if (parseInt(pp) < 50) {
      percip.style.backgroundColor = "#ffdf5b";
    } else {
      percip.style.backgroundColor = "#ff7674";
    }
    if (parseInt(w) < 4) {
      wind.style.backgroundColor = "lightgreen";
    } else if (parseInt(w) < 8) {
      wind.style.backgroundColor = "#ffdf5b";
    } else {
      wind.style.backgroundColor = "#ff7674";
    }
    if (parseInt(f) < 5) {
      feels.style.backgroundColor = "lightblue";
    } else if (parseInt(f) <= 25) {
      feels.style.backgroundColor = "lightgreen";
    } else if (parseInt(f) <= 30) {
      feels.style.backgroundColor = "#ffdf5b";
    } else {
      feels.style.backgroundColor = "#ff7674";
    }
  }

  function unixToDay(time) {
    const date = new Date(time * 1000);
    const days = ["Mon", "Tue", "Wen", "Thur", "Fri", "Sat", "Sun"];

    const day = days[date.getDay()];
    return day;
  }

  function unixToHour(time) {
    const date = new Date(time * 1000);
    const hour = date.getHours();
    return hour;
  }

  function unixToTime(time) {
    const date = new Date(time * 1000);
    const hour = date.getHours();
    const minutes = date.getMinutes();
    let myDate = `${hour}:${minutes}`;
    return myDate;
  }

  function showExtended(cc, dp, h, o, p, v, wb, wg) {
    const extended = document.getElementById("extended");
    const extendedChildren = document.getElementById("extended-children");

    extended.addEventListener("click", () => {
      const table = document.getElementById("tbody-current");

      const extendedForecast = [
        { title: "Cloud cover: ", value: cc },
        { title: "Dew point", value: dp },
        { title: "Humidity: ", value: h },
        { title: "Ozone: ", value: o },

        { title: "Pressure: ", value: p },
        { title: "visibility: ", value: v },
        { title: "Wind bearing: ", value: wb },
        { title: "Wind gust: ", value: wg },
      ];

      extended.classList.toggle("active");
      extendedChildren.classList.toggle("d-none");
      extendedChildren.classList.toggle("d-block");

      if (table.hasChildNodes()) {
        table.innerHTML = "";
      }

      extendedForecast.forEach((element) => {
        const row = document.createElement("tr");
        row.innerHTML = `<td>${element.title}</td><td>${element.value}</td>`;
        table.appendChild(row);
      });
    });
  }

  function showDaily(time, high, low, desc, perc, id) {
    const dailySection = document.getElementById("daily-section");
    const day = document.createElement("div");
    day.innerHTML = `
    <div class="mb-3 ml-4 mr-4 shadow d-flex flex-row">
    
      <div class= "day-forecast">
        <div class="day-temp-icon-daily-div">
          <h4 class="pl-3 pr-3 f-size">${time} </h4>
          <h4 class="pr-3 f-size-2"><strong>${high} / ${low}</strong></h4>
          <canvas
                class="align-self-center f-size"
                id="icons-${id}"
                width="32"
                height="32"
              ></canvas>
        </div>    
        <h5 class="f-size daily-desc-show">${desc}</h5>
        
        <div class="d-flex align-items-center justify-content-end">

          <div class="d-flex pr-4">
            <span style="color: rgb(0, 102, 255);"
              ><i class="fas fa-tint"></i
            ></span>
            <h5 class="pl-2 f-size">
            ${perc}
            </h5>
          </div>
        </div>
      </div> </div>`;

    dailySection.appendChild(day);
  }

  function showHourly(time, high, desc, perc, icon, id) {
    const hourlySection = document.getElementById("hourly-section");
    const hour = document.createElement("div");
    hour.innerHTML = `
    <div class="hourly-single-item  shadow ">
    
      <div class="d-flex align-items-center justify-content-between hour-forecast">
        <div class="d-flex align-items-center">
          <h4 class="pl-4 pr-4">${time}<span class="hourly-time-show">:00</span> </h4>
          <h4 class="pr-4"><strong>${high}</strong></h4>
          <canvas
                class="align-self-center"
                id="icon-${id}"
                width="32"
                height="32"
              ></canvas>
        </div>    
        <h5 class="hourly-description-show">${desc}</h5>
        
        <div class="d-flex align-items-center justify-content-end">

          <div class="d-flex pr-4">
            <span style="color: rgb(0, 102, 255);"
              ><i class="fas fa-tint"></i
            ></span>
            <h5 class="pl-2">
            ${perc}
            </h5>
          </div>
        </div>
      </div>`;

    hourlySection.appendChild(hour);
  }

  // function showDailyExtended() {
  //   const dailyExtended = document.getElementById("daily-extended");
  //   const dailyExtendedChildren = document.getElementById(
  //     "daily-extended-children"
  //   );

  //   dailyExtended.addEventListener("click", () => {
  //     const table = document.getElementById("tbody-daily");

  //     const dailyExtendedForecast = [
  //       { title: "Cloud cover: " },
  //       { title: "Dew point" },
  //       { title: "Humidity: " },
  //       { title: "Ozone: " },
  //       { title: "Percip intensity: " },
  //       { title: "Percip type: " },
  //       { title: "Pressure: " },
  //       { title: "visibility: " },
  //       { title: "Wind bearing: " },
  //       { title: "Wind gust: " },
  //     ];
  //     dailyExtendedChildren.classList.remove("d-none");
  //     // dailyExtendedChildren.classList.toggle("d-block");

  //     if (table.hasChildNodes()) {
  //       table.innerHTML = "";
  //     }

  //     dailyExtendedForecast.forEach((element) => {
  //       const row = document.createElement("tr");
  //       row.innerHTML = `<td>${element.title}</td><td></td>`;
  //       table.appendChild(row);
  //     });
  //   });
  // }
});
