import { ChangeDetectionStrategy, Component, isDevMode } from '@angular/core';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { '[class.is-dev]': 'dev' },
  template: '<router-outlet />',
})
export class App {
  protected readonly dev = isDevMode();
}
