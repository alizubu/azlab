import type { Metadata } from 'next';
import { EditorClient } from './EditorClient';

export const metadata: Metadata = {
  title: 'Editor — AZLab',
  description: 'Creative design editor',
};

export default async function EditorPage(props: PageProps<'/editor/[projectId]'>) {
  const { projectId } = await props.params;

  return <EditorClient projectId={projectId} />;
}
