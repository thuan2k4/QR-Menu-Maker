import { useParams } from 'react-router-dom';
import { MenuProvider } from './Menu/MenuProvider';
import MenuRenderer from './Menu/MenuRenderer';
import PublicMenuFilterSortControls from './Menu/PublicMenuFilterSortControls';

export default function PublicMenu() {
  const { slug } = useParams<{ slug: string }>();

  if (!slug) {
    return null;
  }

  return (
    <MenuProvider slug={slug}>
      <PublicMenuFilterSortControls />
      <MenuRenderer />
    </MenuProvider>
  );
}
