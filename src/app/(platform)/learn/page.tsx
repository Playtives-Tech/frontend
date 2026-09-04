import { BookOpen } from 'lucide-react';
import { EmptyPage } from '@/components/navigation/empty-page';
export default function LearnPage(): React.JSX.Element {
  return <EmptyPage eyebrow="Knowledge" title="Learn with confidence" description="Simple, useful guidance for every stage of your investment journey." icon={BookOpen} />;
}
