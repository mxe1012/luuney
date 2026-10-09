import './styles/styles.css'
import './styles/music_dashboard.css'
import './styles/audio_player.css'
import './styles/search_pane.css'
import './styles/playlist_pane.css'
import './styles/snackbar.css'
import "./styles/favorite.css"

import { MainPane } from './ui/Containers';
import Dashboard from './ui/Dashboard';
import SnackbarProvider from './hooks/SnackbarContext';

export default function App() {

	return (
		<>
			<MainPane>
				<SnackbarProvider>
					<Dashboard />
				</SnackbarProvider>
			</MainPane>
		</>	
	);
}