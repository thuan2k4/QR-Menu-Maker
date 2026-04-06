import { useMenuContext } from './MenuProvider';
import TemplateClassic from './Templates/Classic/TemplateClassic';
import TemplateModernGrid from './Templates/ModernGrid/TemplateModernGrid';

export default function MenuRenderer() {
  const { selectedTemplate } = useMenuContext();

  switch (selectedTemplate.id) {
    case 'modern_grid':
      return <TemplateModernGrid />;
    default:
      return <TemplateClassic />;
  }
}
