import type { Metadata } from 'next';
import { ProjectsDashboard } from './ProjectsDashboard';

export const metadata: Metadata = {
  title: 'Projects — AZLab',
  description: 'Your creative projects',
};

export default function ProjectsPage() {
  return <ProjectsDashboard />;
}
