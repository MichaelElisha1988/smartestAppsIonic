import { animate, style, transition, trigger } from '@angular/animations';
import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { GeneralDataService } from 'src/app/services/general-data.service';
import { LoginService } from 'src/app/services/login.service';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
  standalone: true,
  imports: [CommonModule],
  animations: [
    trigger('openClose', [
      transition(':enter', [
        style({ opacity: 0, height: '0px' }),
        animate('0.3s', style({ opacity: 1, height: '*' })),
      ]),
      transition(':leave', [animate('0.3s', style({ opacity: 0, height: 0 }))]),
    ]),
  ],
})
export class HeaderComponent {
  isOpenBurger: boolean = false;
  router = inject(Router);
  appDataStore = inject(GeneralDataService).appDataStore;
  loginService = inject(LoginService);

  widgetHidden: boolean = false;
  widgetBtnStyle: 'standard' | 'highlight' | 'neon' = 'standard';
  appTheme: 'neon' | 'bright' | 'ocean' | 'capuchino' | 'smartest' = 'neon';

  constructor() {}

  ngOnInit() {
    // Default to hidden (true) if not 'false'
    this.widgetHidden = localStorage.getItem('widgetHidden') !== 'false';
    
    // Restore Widget Button Style
    const savedStyle = localStorage.getItem('widgetBtnStyle');
    if (savedStyle && ['standard', 'highlight', 'neon'].includes(savedStyle)) {
        this.widgetBtnStyle = savedStyle as any;
    }

    // Restore App Theme
    const savedTheme = localStorage.getItem('appTheme');
    if (savedTheme && ['neon', 'bright', 'ocean', 'capuchino', 'smartest'].includes(savedTheme)) {
        this.appTheme = savedTheme as any;
    }
    this.applyTheme();
  }

  relocate(nav: string) {
    this.isOpenBurger = false;
    this.router.navigate([nav]);
  }

  logOut() {
    this.isOpenBurger = false;
    this.loginService.logOut();
  }
  
  cycleWidgetBtnStyle() {
      const styles: ('standard' | 'highlight' | 'neon')[] = ['standard', 'highlight', 'neon'];
      const currentIndex = styles.indexOf(this.widgetBtnStyle);
      const nextIndex = (currentIndex + 1) % styles.length;
      this.widgetBtnStyle = styles[nextIndex];
      localStorage.setItem('widgetBtnStyle', this.widgetBtnStyle);
  }

  cycleAppTheme() {
      const themes: ('neon' | 'bright' | 'ocean' | 'capuchino' | 'smartest')[] = ['neon', 'bright', 'ocean', 'capuchino', 'smartest'];
      const currentIndex = themes.indexOf(this.appTheme);
      const nextIndex = (currentIndex + 1) % themes.length;
      this.appTheme = themes[nextIndex];
      localStorage.setItem('appTheme', this.appTheme);
      this.applyTheme();
  }

  applyTheme() {
      // Remove all theme classes first
      document.body.classList.remove('theme-bright', 'theme-ocean', 'theme-capuchino', 'theme-smartest');
      
      // Add the active theme class (except for default 'neon')
      if (this.appTheme === 'bright') {
          document.body.classList.add('theme-bright');
      } else if (this.appTheme === 'ocean') {
          document.body.classList.add('theme-ocean');
      } else if (this.appTheme === 'capuchino') {
          document.body.classList.add('theme-capuchino');
      } else if (this.appTheme === 'smartest') {
          document.body.classList.add('theme-smartest');
      }
  }

  toggleWidget() {
    this.isOpenBurger = false;
    const tawk = (window as any).Tawk_API;
    if (tawk) {
      if (tawk.isChatHidden()) {
        tawk.showWidget();
        localStorage.setItem('widgetHidden', 'false');
        this.widgetHidden = false;
      } else {
        tawk.hideWidget();
        localStorage.setItem('widgetHidden', 'true');
        this.widgetHidden = true;
      }
    }
  }
}
