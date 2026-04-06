import { useMenuContext } from './MenuProvider';
import TemplateClassic from './Templates/Classic/TemplateClassic';
import TemplateModernGrid from './Templates/ModernGrid/TemplateModernGrid';
import TemplateVibrant from './Templates/Vibrant/TemplateVibrant';
import TemplateMinimal from './Templates/Minimal/TemplateMinimal';
import TemplateBakery from './Templates/Bakery/TemplateBakery';
import TemplateOrganicMarket from './Templates/OrganicMarket/TemplateOrganicMarket';

export default function MenuRenderer() {
  const { selectedTemplate } = useMenuContext();

  switch (selectedTemplate.id) {
    case 'modern_grid':
      return <TemplateModernGrid />;
    case 'vibrant':
      return <TemplateVibrant />;
    case 'minimal':
      return <TemplateMinimal />;
    case 'bakery':
      return <TemplateBakery />;
    case 'organic_market':
      return <TemplateOrganicMarket />;
    default:
      return <TemplateClassic />;
  }
}
