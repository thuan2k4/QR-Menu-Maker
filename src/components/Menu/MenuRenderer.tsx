import { useMenuContext } from './MenuProvider';
import TemplateClassic from './Templates/Classic/TemplateClassic';
import TemplateModernGrid from './Templates/ModernGrid/TemplateModernGrid';
import TemplateVibrant from './Templates/Vibrant/TemplateVibrant';
import TemplateMinimal from './Templates/Minimal/TemplateMinimal';
import TemplateBakery from './Templates/Bakery/TemplateBakery';
import TemplateOrganicMarket from './Templates/OrganicMarket/TemplateOrganicMarket';
import TemplateCoffeeAtelier from './Templates/CoffeeAtelier/TemplateCoffeeAtelier';
import TemplateMatchaSignature from './Templates/MatchaSignature/TemplateMatchaSignature';

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
    case 'coffee_atelier':
      return <TemplateCoffeeAtelier />;
    case 'matcha_signature':
      return <TemplateMatchaSignature />;
    default:
      return <TemplateClassic />;
  }
}
