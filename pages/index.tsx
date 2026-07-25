import * as React from 'react';
import styled, { keyframes } from 'styled-components';
import _ from 'underscore';

import Head from 'pages/head';

// Key restricted to requests from this domain at https://console.cloud.google.com/apis/credentials?authuser=1&project=whenisgoldenhour
//
// Securing the google maps api key
// https://stackoverflow.com/questions/39625587/how-do-i-securely-use-google-api-keys/39625963
const API_KEY = process.env.GCP_MAPS_API;

const GEOLOCATE_SRC = `https://www.googleapis.com/geolocation/v1/geolocate?key=${API_KEY}`;
const GEOCODE_SRC = `https://maps.googleapis.com/maps/api/js?key=${API_KEY}`;

const FONT_SRC = 'https://fonts.googleapis.com/css?family=Anton|Fjalla+One|Josefin+Sans|Lobster|Raleway';

let hasDisplayedGoldenHour = false;
const SunCalc = require('suncalc');

export default class App extends React.Component<any, any> {

    constructor(props: any) {
        super(props);
        this.state = { data: undefined, city: undefined, start: undefined, end: undefined, cityResolved: false };
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
            if (location) {
                component.resolveCity(location);
            } else {
                component.setState({ cityResolved: true });
            }
        })
        // Whatever goes wrong, stop waiting -- otherwise the loading state
        // never ends. The times don't need the geocoder, only the city does.
        .catch((error) => {
            console.error(error);
            component.setState({ cityResolved: true });
        });
    }

    // The maps script is async, so google may not exist yet when geolocation
    // comes back -- on a cold load it usually doesn't.
    resolveCity(location: any, attempt: number = 0) {
        const component = this;

        if (typeof google === 'undefined' || !google.maps) {
            if (attempt >= 40) {
                component.setState({ cityResolved: true });
            } else {
                setTimeout(() => component.resolveCity(location, attempt + 1), 250);
            }
            return;
        }

        const loc = {
            location: { lat: location.lat, lng: location.lng },
        };

        new google.maps.Geocoder().geocode(loc, (results: any, status: any) => {
            if (status === 'OK') {
                const r = results[0];
                if (r) {
                    const locality = _(r.address_components).find((v: any) => {
                        return _(v.types).contains('locality');
                    });
                    if (locality) {
                        component.setState({ city: locality.long_name });
                    }
                }
            } else {
                console.error(status);
            }
            component.setState({ cityResolved: true });
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

    renderLoading() {
        return (
            <Loading>
                <Sky>
                    <Sun/>
                    <Sparkles>
                        <Sparkle/>
                        <Sparkle/>
                        <Sparkle/>
                        <Sparkle/>
                        <Sparkle/>
                    </Sparkles>
                    <Horizon/>
                </Sky>
            </Loading>
        );
    }

    render() {
        var { data, city, start, end, cityResolved } = this.state;

        if (data && data.location) {
            this.getGoldenHour(data.location);
        }

        const isLoading = !(cityResolved && start && end);

        return (
            <div>
                <Head/>
                <script async src={ GEOCODE_SRC }></script>
                <link href={ FONT_SRC } rel="stylesheet"/>
                <Question>
                    when is golden hour today?
                </Question>
                <br></br>

                { isLoading ? this.renderLoading() :
                    <React.Fragment>
                        { city &&
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
                    </React.Fragment>
                }

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
    color: rgba(0, 0, 0, 0.85);
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

// Loading state: a sun that sinks below a glowing horizon while we work out
// where you are and when the light turns.

const sink = keyframes`
    0%   { transform: translateY(-26px) scale(0.94); opacity: 0; }
    12%  { transform: translateY(-22px) scale(1);    opacity: 1; }
    72%  { transform: translateY(22px)  scale(1.1);  opacity: 1; }
    88%  { transform: translateY(38px)  scale(1.14); opacity: 0.45; }
    100% { transform: translateY(48px)  scale(1.16); opacity: 0; }
`;

const flare = keyframes`
    0%, 100% {
        box-shadow: 0 0 24px 6px rgba(255, 209, 148, 0.55),
                    0 0 60px 18px rgba(255, 148, 92, 0.35);
    }
    50% {
        box-shadow: 0 0 40px 12px rgba(255, 232, 190, 0.85),
                    0 0 96px 34px rgba(255, 148, 92, 0.5);
    }
`;

const twinkle = keyframes`
    0%, 100% { transform: scale(0.4); opacity: 0; }
    40%      { transform: scale(1.15); opacity: 0.95; }
    70%      { transform: scale(0.7); opacity: 0.25; }
`;

const glowLine = keyframes`
    0%, 100% { opacity: 0.35; transform: scaleX(0.82); }
    72%      { opacity: 1;    transform: scaleX(1); }
`;

const breathe = keyframes`
    0%, 100% { opacity: 0.55; }
    50%      { opacity: 1; }
`;

const Loading = styled.div`
    text-align: center;
    margin-top: 20px;

    /* Keep the warmth, drop the movement. */
    @media (prefers-reduced-motion: reduce) {
        & > * , & > * > * , & > * > * > * {
            animation: ${breathe} 3s ease-in-out infinite !important;
            transform: none;
        }
    }
`;

// The box is deliberately much larger than the sun so the halo tapers to
// nothing on its own well inside every edge -- nothing to clip. Only the
// bottom is masked, so the sun dissolves into haze as it drops past the
// horizon. Negative margins absorb the empty space that headroom buys.
const Sky = styled.div`
    position: relative;
    width: 360px;
    height: 300px;
    margin: -70px auto -34px;
    -webkit-mask-image: linear-gradient(to bottom, #000 0%, #000 76%, rgba(0, 0, 0, 0) 96%);
    mask-image: linear-gradient(to bottom, #000 0%, #000 76%, rgba(0, 0, 0, 0) 96%);
    -webkit-mask-repeat: no-repeat;
    mask-repeat: no-repeat;
`;

const Sun = styled.div`
    position: absolute;
    left: 50%;
    bottom: 60px;
    width: 92px;
    height: 92px;
    margin-left: -46px;
    border-radius: 50%;
    background: radial-gradient(circle at 50% 38%, #fff6e0 0%, #ffd194 42%, #ff9d5c 78%, #f97a53 100%);
    animation: ${sink} 3.6s ease-in infinite, ${flare} 2.4s ease-in-out infinite;
`;

const Horizon = styled.div`
    position: absolute;
    left: 0;
    right: 0;
    bottom: 60px;
    height: 3px;
    border-radius: 3px;
    background: linear-gradient(to right,
        rgba(255, 255, 255, 0) 0%,
        rgba(255, 244, 214, 0.9) 50%,
        rgba(255, 255, 255, 0) 100%);
    animation: ${glowLine} 3.6s ease-in-out infinite;
`;

const Sparkles = styled.div`
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
`;

const Sparkle = styled.div`
    position: absolute;
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: radial-gradient(circle, #fffdf5 0%, rgba(255, 226, 173, 0.6) 55%, rgba(255, 226, 173, 0) 100%);
    animation: ${twinkle} 2.2s ease-in-out infinite;

    &:nth-of-type(1) { top: 118px; left: 92px;  animation-delay: 0s; }
    &:nth-of-type(2) { top: 152px; left: 272px; animation-delay: 0.45s; }
    &:nth-of-type(3) { top: 96px;  left: 246px; animation-delay: 0.9s; }
    &:nth-of-type(4) { top: 198px; left: 62px;  animation-delay: 1.3s; }
    &:nth-of-type(5) { top: 228px; left: 292px; animation-delay: 1.75s; }
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
