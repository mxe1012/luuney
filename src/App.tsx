import './styles/styles.css'
import './styles/bg.css'
import './styles/music_dashboard.css'

import { MainPane, MusicDashboard } from './ui/Containers';

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