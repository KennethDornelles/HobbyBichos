import { Routes } from '@angular/router';
import { HomeComponent } from './home/home.component';
import { CarrinhoComponent } from './carrinho/carrinho.component';

export const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'home', component: HomeComponent },
  { path: 'carrinho', component: CarrinhoComponent },
  { path: '**', redirectTo: '' }
];
