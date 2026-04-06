import { useParams } from 'react-router-dom';
import { MenuProvider } from './Menu/MenuProvider';
import MenuRenderer from './Menu/MenuRenderer';

export default function PublicMenu() {
  const { slug } = useParams<{ slug: string }>();

  if (!slug) {
    return null;
  }

  return (
    <MenuProvider slug={slug}>
      <MenuRenderer />
    </MenuProvider>
  );
}
