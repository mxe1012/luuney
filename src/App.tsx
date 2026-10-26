import './styles/styles.css'
import './styles/music_dashboard.css'
import './styles/audio_player.css'
import './styles/search_pane.css'
import './styles/playlist_pane.css'
import './styles/snackbar.css'
import './styles/action.css'
import './styles/playlist_folder.css'
import './styles/playlist_menu.css'
import './styles/extra_list.css'
import './styles/skeleton.css'
import './styles/pagination.css'

import { MainPane } from './ui/Containers';
import Dashboard from './ui/Dashboard';
import SnackbarProvider from './hooks/SnackbarContext';
import Footer from './ui/Footer'

export default function App() {

	return (
		<>
			<MainPane>
				<SnackbarProvider>
					<Dashboard />
				</SnackbarProvider>
			</MainPane>
			<Footer />
		</>	
	);
}