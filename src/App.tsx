import './styles/styles.css'
import './styles/music_dashboard.css'

import { MainPane } from './ui/Containers';
import Dashboard from './ui/Dashboard';

export default function App() {

	return (
		<>
			<MainPane>
				<Dashboard />
			</MainPane>
		</>	
	);
}