import * as React from 'react';
import styled from 'styled-components';
import Geocode from 'react-geocode';
import { checkServerIdentity } from 'tls';
import _ from 'underscore';

const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const now = new Date();
const day = days[ now.getDay() ];
const month = months[ now.getMonth() ];

const API_KEY = 'AIzaSyBga-_e2ycgyTSAJTegMmShBCbfqgwVwtk';

let city;
let hasDisplayedGoldenHour = false;
const SunCalc = require('suncalc');

export default class App extends React.Component {

    constructor(props: any) {
        super(props);
        this.state = { data: undefined, city: undefined, start: undefined, end: undefined };
      }

    componentDidMount() {
        var component = this;
        fetch(`https://www.googleapis.com/geolocation/v1/geolocate?key=${API_KEY}`,
            {
            method: 'post',
          })
          .then(function(response) {
            return response.json();
          })
          .then(function(json) {
            var data = json;
            component.setState({ data: json });

            const location = data.location;
            // this.geoSuccess({ coords: { latitude: success.location.lat, longitude: success.location.lng } });

            Geocode.setApiKey(API_KEY);
            Geocode.fromLatLng(location.lat.toString(), location.lng.toString())
                .then(
                    response => {
                        const address = response.results[0].formatted_address;
                        var firstResult = response.results[0]

                        if (firstResult) {
                            const locality = _(firstResult.address_components).find((v) => {
                                return _(v.types).contains('locality');
                            });
                        

                            // var locationEl = document.getElementById("location");
                            // locationEl.innerHTML = '..in ' + city.long_name;
                            city = locality.long_name;
                            component.setState({ city: locality.long_name });
                        } else {
                            alert("No results found");
                        }
                    },
                    error => {
                        console.error(error);
                    }
                );
            });
    }

    public getGoldenHour(location: any) {
        const lat = location.lat;
        const lng = location.lng;

        // Get various times based on latitude/tongitude.
        var times = SunCalc.getTimes(new Date(), lat, lng);

        var startHour = times.goldenHour.getHours();
        var startAmPm = startHour < 12 ? "am" : "pm";
        if (startHour > 12) {
            startHour = startHour - 12;
        }
        var startMins = times.goldenHour.getMinutes();
        if (startMins < 10) {
            startMins = "0" + startMins;
        }

        var endHour = times.sunset.getHours();
        var endAmPm = endHour < 12 ? "am" : "pm";
        if (endHour > 12) {
            endHour = endHour - 12;
        }
        var endMins = times.sunset.getMinutes();
        if (endMins < 10) {
            endMins = "0" + endMins;
        }

        if (!hasDisplayedGoldenHour) {
            hasDisplayedGoldenHour = true;
            this.setState({
                start: startHour + ":" + startMins + startAmPm,
                end: endHour + ":" + endMins + endAmPm,
            });
        }
    }

    public getAddress(location) {

        const component = this;

        

    }

    render() {
        var { data, city, start, end } = this.state;

        if (data && data.location) {
            this.getGoldenHour(data.location);
        }
        
        return (
            <div>
                <link href="https://fonts.googleapis.com/css?family=Anton|Fjalla+One|Josefin+Sans|Lobster|Raleway" rel="stylesheet"/>
                <Question>
                    when is golden hour today?
                </Question>
        
                { data && data.location &&
                    <Location>
                        ..in { city }
                    </Location>
                }
                <br></br>

                <Time>
                    <Message>
                        {start}
                    </Message>
                    <Message>
                        until
                    </Message>
                    <Message>
                        { end }
                    </Message>
                </Time>

                <Credits>
                    <div>Built by Karl Shouler</div>
                    <br></br>
                    <Anchor href="http://twitter.com/_ksho">twitter</Anchor> . <Anchor href="http://instagram.com/_ksho">instagram</Anchor> . <Anchor href="http://ksho.co">web</Anchor>
                </Credits>
            </div>
        )
    }
}

const Question = styled.div`
    text-align: center;
    font-size: 60px;
    font-family: "Lobster";
    /*font-weight: 300;*/
    margin-top: 200px;

    @media (orientation : portrait) {
        font-size: 72px;
        margin-top: 300px;
    }
`;

const Location = styled.div`
    text-align: center;
    font-size: 58px;
    font-family: "Fjalla One";
    font-weight: 300;
    margin-top: 20px; 
`;

const Time = styled.div`
    margin-top: 20px;
	text-align: center;
`;

const Message = styled.div`
    text-align: center;
    font-size: 90px;
    font-family: "Fjalla One";
    font-weight: 700;
    color: white;
    display: inline-block;
    margin-right: 22px;

    @media (orientation : portrait) {
        display: block;
        margin-right: 0;
    }
`;

const Credits = styled.div`
    color: #397cd0;
	text-align: center;
    font-size: 16px;
    font-family: "Fjalla One";
    font-weight: 200;
    margin-top: 150px;

    @media (orientation : portrait) {
        color: #397cd0;
        text-align: center;
        font-size: 20px;
        font-family: "Fjalla One";
        font-weight: 200;
        margin-top: 250px;
    }
`;

const Anchor = styled.a`
	color: inherit;
`;
