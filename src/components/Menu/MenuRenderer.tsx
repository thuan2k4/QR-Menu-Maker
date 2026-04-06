import { useMenuContext } from './MenuProvider';
import TemplateClassic from './Templates/Classic/TemplateClassic';
import TemplateModernGrid from './Templates/ModernGrid/TemplateModernGrid';
import TemplateVibrant from './Templates/Vibrant/TemplateVibrant';

export default function MenuRenderer() {
  const { selectedTemplate } = useMenuContext();

  switch (selectedTemplate.id) {
    case 'modern_grid':
      return <TemplateModernGrid />;
    case 'vibrant':
      return <TemplateVibrant />;
    default:
      return <TemplateClassic />;
  }
}
