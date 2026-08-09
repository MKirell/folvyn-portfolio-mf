import logoDark from '@/assets/folvyn-logo-dark.png'
import logoLight from '@/assets/folvyn-logo-light.png'

export function brandLogo(isLightTheme: boolean): string {
  return isLightTheme ? logoDark : logoLight
}
