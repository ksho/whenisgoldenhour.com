import * as React from 'react';
import Script from 'next/script';
import styled, { keyframes } from 'styled-components';
import * as SunCalc from 'suncalc';

import Head from '@/components/Head';

// Key restricted to requests from this domain at https://console.cloud.google.com/apis/credentials?authuser=1&project=whenisgoldenhour
//
// Securing the google maps api key
// https://stackoverflow.com/questions/39625587/how-do-i-securely-use-google-api-keys/39625963
const API_KEY = process.env.NEXT_PUBLIC_GCP_MAPS_API;

const GEOLOCATE_SRC = `https://www.googleapis.com/geolocation/v1/geolocate?key=${API_KEY}`;
const GEOCODE_SRC = `https://maps.googleapis.com/maps/api/js?key=${API_KEY}&loading=async`;

type Location = { lat: number; lng: number };

type State = {
    location?: Location;
    city?: string;
    cityResolved: boolean;
};

// The maps script loads async, so google may not exist yet when geolocation
// comes back -- on a cold load it usually doesn't.
function waitForMaps(timeout = 10_000): Promise<void> {
    return new Promise((resolve, reject) => {
        const deadline = Date.now() + timeout;

        const check = () => {
            if (typeof google !== 'undefined' && typeof google.maps?.importLibrary === 'function') {
                resolve();
            } else if (Date.now() > deadline) {
                reject(new Error('the maps script never loaded'));
            } else {
                setTimeout(check, 250);
            }
        };

        check();
    });
}

function formatTime(time: Date) {
    const hours = time.getHours();
    const minutes = time.getMinutes().toString().padStart(2, '0');

    return `${hours % 12 || 12}:${minutes}${hours < 12 ? 'am' : 'pm'}`;
}

function getGoldenHour({ lat, lng }: Location) {
    // Get various times based on latitude/longitude.
    const times = SunCalc.getTimes(new Date(), lat, lng);

    // Far enough north or south the sun doesn't set at all, and suncalc has
    // no time to give us.
    if (!times.goldenHour || !times.sunset) {
        return undefined;
    }

    return {
        start: formatTime(times.goldenHour),
        end: formatTime(times.sunset),
    };
}

export default class App extends React.Component<Record<string, never>, State> {

    state: State = { location: undefined, city: undefined, cityResolved: false };

    async componentDidMount() {
        try {
            const response = await fetch(GEOLOCATE_SRC, { method: 'post' });
            const { location } = await response.json();

            if (!location) {
                this.setState({ cityResolved: true });
                return;
            }

            this.setState({ location });
            await this.resolveCity(location);
        // Whatever goes wrong, stop waiting -- otherwise the loading state
        // never ends. The times don't need the geocoder, only the city does.
        } catch (error) {
            console.error(error);
            this.setState({ cityResolved: true });
        }
    }

    async resolveCity(location: Location) {
        try {
            await waitForMaps();

            const { Geocoder } = (await google.maps.importLibrary(
                'geocoding'
            )) as google.maps.GeocodingLibrary;

            const { results } = await new Geocoder().geocode({ location });
            const locality = results[0]?.address_components.find((component) =>
                component.types.includes('locality')
            );

            if (locality) {
                this.setState({ city: locality.long_name });
            }
        } catch (error) {
            console.error(error);
        } finally {
            this.setState({ cityResolved: true });
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
        const { location, city, cityResolved } = this.state;

        const times = location && getGoldenHour(location);

        // Only the city lookup is worth waiting on -- if it fails we still
        // have the times, and if geolocation itself failed there is nothing
        // more coming.
        const isLoading = !cityResolved;

        return (
            <div>
                <Head/>
                <Script src={ GEOCODE_SRC } strategy="afterInteractive"/>
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

                        { times &&
                            <Time>
                                <Message>
                                    { times.start }
                                </Message>
                                <Message>
                                    until
                                </Message>
                                <Message>
                                    { times.end }
                                </Message>
                            </Time>
                        }
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
