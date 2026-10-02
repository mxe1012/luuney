import './styles/styles.css'
import './styles/bg.css'
import './styles/music_dashboard.css'

import { MainPane } from './ui/Containers';
import MusicDashboard from './ui/MusicDashboard';

export default function App() {

	return (
		<div className='bg'>
			<br />
			<MainPane>
				<MusicDashboard coverArt={"/assets/placeholder-cover.svg"}/>
			</MainPane>
		</div>	
	);
}