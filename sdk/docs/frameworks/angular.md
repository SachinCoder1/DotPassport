# Angular Integration

Integrate DotPassport widgets with Angular.

## Installation

```bash
npm install @dotpassport/sdk
```

---

## Basic Component

```typescript
// dotpassport-widget.component.ts
import {
  Component,
  Input,
  OnInit,
  OnDestroy,
  OnChanges,
  SimpleChanges,
  ElementRef,
  ViewChild
} from '@angular/core';
import { createWidget, type WidgetConfig } from '@dotpassport/sdk';
import { environment } from '../environments/environment';

@Component({
  selector: 'app-dotpassport-widget',
  template: '<div #container></div>',
  standalone: true
})
export class DotPassportWidgetComponent implements OnInit, OnDestroy, OnChanges {
  @Input() address!: string;
  @Input() type: WidgetConfig['type'] = 'reputation';
  @Input() theme: 'light' | 'dark' | 'auto' = 'light';

  @ViewChild('container', { static: true }) container!: ElementRef<HTMLDivElement>;

  private widget: ReturnType<typeof createWidget> | null = null;

  ngOnInit(): void {
    this.widget = createWidget({
      apiKey: environment.dotpassportApiKey,
      address: this.address,
      type: this.type,
      theme: this.theme
    });
    this.widget.mount(this.container.nativeElement);
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (this.widget) {
      if (changes['address'] || changes['theme']) {
        this.widget.update({
          address: this.address,
          theme: this.theme
        });
      }
    }
  }

  ngOnDestroy(): void {
    this.widget?.destroy();
  }

  refresh(): void {
    this.widget?.refresh();
  }
}
```

### Usage

```typescript
// app.component.ts
import { Component } from '@angular/core';
import { DotPassportWidgetComponent } from './dotpassport-widget.component';

@Component({
  selector: 'app-root',
  template: `
    <app-dotpassport-widget
      [address]="walletAddress"
      type="reputation"
      [theme]="currentTheme"
    />
    <button (click)="toggleTheme()">Toggle Theme</button>
  `,
  standalone: true,
  imports: [DotPassportWidgetComponent]
})
export class AppComponent {
  walletAddress = '5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY';
  currentTheme: 'light' | 'dark' = 'light';

  toggleTheme(): void {
    this.currentTheme = this.currentTheme === 'light' ? 'dark' : 'light';
  }
}
```

---

## Reputation Widget Component

```typescript
// reputation-widget.component.ts
import {
  Component,
  Input,
  Output,
  EventEmitter,
  OnInit,
  OnDestroy,
  OnChanges,
  SimpleChanges,
  ElementRef,
  ViewChild
} from '@angular/core';
import { createWidget } from '@dotpassport/sdk';
import { environment } from '../environments/environment';

@Component({
  selector: 'app-reputation-widget',
  template: '<div #container [class]="className"></div>',
  standalone: true
})
export class ReputationWidgetComponent implements OnInit, OnDestroy, OnChanges {
  @Input() address!: string;
  @Input() theme: 'light' | 'dark' | 'auto' = 'light';
  @Input() showCategories = true;
  @Input() maxCategories = 6;
  @Input() compact = false;
  @Input() className = '';

  @Output() widgetLoad = new EventEmitter<void>();
  @Output() widgetError = new EventEmitter<Error>();

  @ViewChild('container', { static: true }) container!: ElementRef<HTMLDivElement>;

  private widget: ReturnType<typeof createWidget> | null = null;

  ngOnInit(): void {
    this.widget = createWidget({
      apiKey: environment.dotpassportApiKey,
      address: this.address,
      type: 'reputation',
      theme: this.theme,
      showCategories: this.showCategories,
      maxCategories: this.maxCategories,
      compact: this.compact,
      onLoad: () => this.widgetLoad.emit(),
      onError: (error) => this.widgetError.emit(error)
    });
    this.widget.mount(this.container.nativeElement);
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (this.widget) {
      this.widget.update({
        address: this.address,
        theme: this.theme,
        showCategories: this.showCategories
      });
    }
  }

  ngOnDestroy(): void {
    this.widget?.destroy();
  }

  refresh(): Promise<void> {
    return this.widget?.refresh() || Promise.resolve();
  }
}
```

### Usage

```typescript
@Component({
  selector: 'app-profile-page',
  template: `
    <app-reputation-widget
      [address]="address"
      [theme]="theme"
      [showCategories]="true"
      (widgetLoad)="onLoad()"
      (widgetError)="onError($event)"
      #reputationWidget
    />
    <button (click)="reputationWidget.refresh()">Refresh</button>
  `,
  standalone: true,
  imports: [ReputationWidgetComponent]
})
export class ProfilePageComponent {
  @ViewChild('reputationWidget') reputationWidget!: ReputationWidgetComponent;

  address = '5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY';
  theme: 'light' | 'dark' = 'light';

  onLoad(): void {
    console.log('Widget loaded');
  }

  onError(error: Error): void {
    console.error('Widget error:', error);
  }
}
```

---

## Service-Based Approach

```typescript
// dotpassport.service.ts
import { Injectable } from '@angular/core';
import { DotPassportClient, DotPassportError } from '@dotpassport/sdk';
import { environment } from '../environments/environment';
import { Observable, from, catchError, throwError } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class DotPassportService {
  private client: DotPassportClient;

  constructor() {
    this.client = new DotPassportClient({
      apiKey: environment.dotpassportApiKey
    });
  }

  getScores(address: string): Observable<any> {
    return from(this.client.getScores(address)).pipe(
      catchError((error) => {
        if (error instanceof DotPassportError) {
          console.error('DotPassport error:', error.statusCode, error.message);
        }
        return throwError(() => error);
      })
    );
  }

  getBadges(address: string): Observable<any> {
    return from(this.client.getBadges(address));
  }

  getProfile(address: string): Observable<any> {
    return from(this.client.getProfile(address));
  }
}
```

### Usage in Component

```typescript
@Component({
  selector: 'app-dashboard',
  template: `
    <div *ngIf="scores$ | async as scores">
      <h2>Total Score: {{ scores.totalScore }}</h2>
    </div>
    <app-reputation-widget [address]="address" />
  `
})
export class DashboardComponent implements OnInit {
  address = '5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY';
  scores$!: Observable<any>;

  constructor(private dotpassport: DotPassportService) {}

  ngOnInit(): void {
    this.scores$ = this.dotpassport.getScores(this.address);
  }
}
```

---

## Multiple Widgets Dashboard

```typescript
// dashboard.component.ts
import { Component, OnInit, OnDestroy, QueryList, ViewChildren, ElementRef } from '@angular/core';
import { createWidget } from '@dotpassport/sdk';
import { environment } from '../environments/environment';

@Component({
  selector: 'app-dashboard',
  template: `
    <div class="dashboard-grid">
      <div #reputationContainer class="widget"></div>
      <div #badgeContainer class="widget"></div>
      <div #profileContainer class="widget"></div>
    </div>
    <button (click)="refreshAll()">Refresh All</button>
  `,
  styles: [`
    .dashboard-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
      gap: 1rem;
    }
    .widget { min-height: 200px; }
  `],
  standalone: true
})
export class DashboardComponent implements OnInit, OnDestroy {
  @ViewChildren('reputationContainer, badgeContainer, profileContainer')
  containers!: QueryList<ElementRef<HTMLDivElement>>;

  private widgets: ReturnType<typeof createWidget>[] = [];
  private address = '5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY';

  ngOnInit(): void {
    const apiKey = environment.dotpassportApiKey;
    const types = ['reputation', 'badge', 'profile'] as const;

    setTimeout(() => {
      this.containers.forEach((container, index) => {
        const widget = createWidget({
          apiKey,
          address: this.address,
          type: types[index]
        });
        widget.mount(container.nativeElement);
        this.widgets.push(widget);
      });
    });
  }

  ngOnDestroy(): void {
    this.widgets.forEach(w => w.destroy());
  }

  refreshAll(): void {
    this.widgets.forEach(w => w.refresh());
  }

  updateAddress(newAddress: string): void {
    this.address = newAddress;
    this.widgets.forEach(w => w.update({ address: newAddress }));
  }
}
```

---

## Environment Configuration

```typescript
// environments/environment.ts
export const environment = {
  production: false,
  dotpassportApiKey: 'your_api_key_here'
};

// environments/environment.prod.ts
export const environment = {
  production: true,
  dotpassportApiKey: 'your_production_api_key'
};
```

---

## Reactive Forms Integration

```typescript
@Component({
  selector: 'app-address-lookup',
  template: `
    <form [formGroup]="form" (ngSubmit)="lookup()">
      <input formControlName="address" placeholder="Enter Polkadot address" />
      <button type="submit" [disabled]="form.invalid">Lookup</button>
    </form>

    <app-reputation-widget
      *ngIf="currentAddress"
      [address]="currentAddress"
    />
  `,
  standalone: true,
  imports: [ReactiveFormsModule, ReputationWidgetComponent, NgIf]
})
export class AddressLookupComponent {
  form = new FormGroup({
    address: new FormControl('', [Validators.required, Validators.minLength(47)])
  });

  currentAddress: string | null = null;

  lookup(): void {
    if (this.form.valid) {
      this.currentAddress = this.form.value.address!;
    }
  }
}
```

---

## Related

- [React Integration](./react.md)
- [Vue Integration](./vue.md)
- [Vanilla JavaScript](./vanilla-js.md)
- [Widget Lifecycle](../widgets/lifecycle.md)
