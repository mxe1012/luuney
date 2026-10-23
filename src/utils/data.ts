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

export async function fetchTrackById(id: number) {

    try {
       const result = await fetch(`https://api.audius.co/v1/tracks/${id}`) 

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

export async function fetchTrackByQuery(query: string) {

    try {
        const result = await fetch(`https://api.audius.co/v1/tracks/search?limit=500&query=${query}`);

        if(result.ok) {
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

export async function fetchTrackTrending() {

    try {
        const result = await fetch(`https://api.audius.co/v1/tracks/trending`);

        if(result.ok) {
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

export async function fetchTrackLatest() {

    try {
        const result = await fetch(`https://api.audius.co/v1/tracks/latest`);

        if(result.ok) {
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

