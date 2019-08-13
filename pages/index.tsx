import * as React from 'react';
import styled from 'styled-components';
import _ from 'underscore';

// Key restricted to requests from this domain at https://console.cloud.google.com/apis/credentials?authuser=1&project=whenisgoldenhour
//
// Securing the google maps api key
// https://stackoverflow.com/questions/39625587/how-do-i-securely-use-google-api-keys/39625963
const API_KEY = 'AIzaSyBga-_e2ycgyTSAJTegMmShBCbfqgwVwtk';

const GEOLOCATE_SRC = `https://www.googleapis.com/geolocation/v1/geolocate?key=${API_KEY}`;
const GEOCODE_SRC = `https://maps.googleapis.com/maps/api/js?key=${API_KEY}`;

const FONT_SRC = 'https://fonts.googleapis.com/css?family=Anton|Fjalla+One|Josefin+Sans|Lobster|Raleway';

let hasDisplayedGoldenHour = false;
const SunCalc = require('suncalc');

export default class App extends React.Component<any, any> {

    constructor(props: any) {
        super(props);
        this.state = { data: undefined, city: undefined, start: undefined, end: undefined };
    }

    componentDidMount() {
        const component = this;
        fetch(GEOLOCATE_SRC, {
            method: 'post',
        })
        .then((response) => {
            return response.json();
        })
        .then((json) => {
            const data = json;
            component.setState({ data: json });

            const location = data.location;
            const geocoder = new google.maps.Geocoder;
            if (location) {
                const loc = {
                    location: { lat: location.lat, lng: location.lng },
                };
    
                geocoder.geocode(loc, (results: any, status: any) => {
                    if (status === 'OK') {
                        const r = results[0];
                        if (r) {
                            const locality = _(r.address_components).find((v: any) => {
                                return _(v.types).contains('locality');
                            });
                            component.setState({ city: locality.long_name });
                        }
                    } else {
                        console.error(status);
                    }
                });
            }
        });
    }

    getGoldenHour(location: any) {
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

    render() {
        var { data, city, start, end } = this.state;

        if (data && data.location) {
            this.getGoldenHour(data.location);
        }
        
        return (
            <div>
                <script async src={ GEOCODE_SRC }></script>
                <link href={ FONT_SRC } rel="stylesheet"/>
                <Question>
                    when is golden hour today?
                </Question>
                <br></br>
        
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
