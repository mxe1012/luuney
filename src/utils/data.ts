// import { sdk } from '@audius/sdk'


// export async function fetchTrack() {
//     const audiusSdk = sdk({
//         apiKey: import.meta.env.VITE_AUDIUS_API_KEY,
//         bearerToken: import.meta.env.VITE_AUDIUS_BEARER_TOKEN,
//     })

//     try {
//         const result = await audiusSdk.tracks.getTrack({ trackId: 'D7KyD'}); 

//         console.log(result); 

//     }
//     catch(e) {
//         console.log(e);
//     }

// }

export async function fetchTrack() {

    try {
       const result = await fetch('https://api.audius.co/v1/tracks/10', {
            headers: {
                Authorization: import.meta.env.VITE_AUDIUS_BEARER_TOKEN
            }
        }) 

        if(result.ok){
            const data = await result.json();
            console.log(data);
            return data;
        }

        throw new Error(`Failed with code ${result.status}`)

    }
    catch(e) {
        console.log(e);
        throw e;
    }

}
