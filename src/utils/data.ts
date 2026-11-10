
export async function fetchTrackById(id: number) {

    try {
       const result = await fetch(`https://api.audius.co/v1/tracks/${id}`) 

        if(result.ok){
            const data = await result.json();
            return data;
        }

        throw new Error(`Failed with code ${result.status}`)

    }
    catch(e) {
        console.error(e);
        throw e;
    }

}

export async function fetchTrackByQuery(query: string) {

    const encodedQuery = encodeURIComponent(query);

    try {
        const result = await fetch(`https://api.audius.co/v1/tracks/search?limit=1000&query=${encodedQuery}`);

        if(result.ok) {
            const data = await result.json();
            return data;
        }

        throw new Error(`Failed with code ${result.status}`)

    }
    catch(e) {
        console.error(e);
        throw e;
    }
}

export async function fetchTrackTrending() {

    try {
        const result = await fetch(`https://api.audius.co/v1/tracks/trending`);

        if(result.ok) {
            const data = await result.json();
            return data;
        }

        throw new Error(`Failed with code ${result.status}`)

    }
    catch(e) {
        console.error(e);
        throw e;
    }
}

export async function fetchTrackLatest() {

    try {
        const result = await fetch(`https://api.audius.co/v1/tracks/latest`);

        if(result.ok) {
            const data = await result.json();
            return data;
        }

        throw new Error(`Failed with code ${result.status}`)

    }
    catch(e) {
        console.error(e);
        throw e;
    }
}

export async function fetchUsers(query: string) {

    const encodedQuery = encodeURIComponent(query);

    try {
        const result = await fetch(`https://api.audius.co/v1/users/search?limit=1000&query=${encodedQuery}`)

        if(result.ok) {
            const data = await result.json();
            return data;
        }

        throw new Error(`Failed with code ${result.status}`)

    }
    catch(e) {
        console.error(e);
        throw e;
    }
}

export async function fetchTracksByUser(id: number) {

    try {
        const result = await fetch(`https://api.audius.co/v1/users/${id}/tracks`)

        if(result.ok) {
            const data = await result.json();
            return data;
        }

        throw new Error(`Failed with code ${result.status}`)

    }
    catch(e) {
        console.error(e);
        throw e;
    }
}
