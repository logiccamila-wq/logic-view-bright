import dynamic from 'next/dynamic';

// Dynamically import App to avoid SSR issues with react-router
const App = dynamic(() => import('@/App'), { ssr: false });

export default function IndexPage() {
  return <App />;
}
