import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-about',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="about-page bg-white">
      <!-- Hero Section -->
      <section class="bg-primary-yellow text-white py-16">
        <div class="container mx-auto px-4 text-center">
          <h1 class="text-4xl font-bold mb-4">Sobre a HobbyBichos</h1>
          <p class="text-xl opacity-90 max-w-2xl mx-auto">
            Conectando apaixonados por animais a uma plataforma completa e confiável
          </p>
        </div>
      </section>

      <!-- Mission Section -->
      <section class="py-16">
        <div class="container mx-auto px-4">
          <div class="max-w-4xl mx-auto">
            <div class="grid md:grid-cols-3 gap-8 text-center">
              <div class="p-6">
                <div class="w-16 h-16 bg-primary-yellow rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg class="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"/>
                  </svg>
                </div>
                <h3 class="text-xl font-semibold mb-2 text-gray-800">Nossa Missão</h3>
                <p class="text-gray-600">
                  Conectar apaixonados por animais a uma plataforma completa e confiável, oferecendo os melhores produtos, serviços e conteúdos para o bem-estar de seus pets.
                </p>
              </div>
              
              <div class="p-6">
                <div class="w-16 h-16 bg-primary-yellow rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg class="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/>
                  </svg>
                </div>
                <h3 class="text-xl font-semibold mb-2 text-gray-800">Nossa Visão</h3>
                <p class="text-gray-600">
                  Ser a maior e mais amada comunidade online para donos de pets no Brasil, reconhecida pela qualidade, variedade e cuidado em tudo o que fazemos.
                </p>
              </div>
              
              <div class="p-6">
                <div class="w-16 h-16 bg-primary-yellow rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg class="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"/>
                  </svg>
                </div>
                <h3 class="text-xl font-semibold mb-2 text-gray-800">Nosso Público</h3>
                <p class="text-gray-600">
                  Donos de pets de todas as idades e perfis, desde pais de primeira viagem de um filhote até criadores experientes que buscam praticidade e qualidade.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- Features Section -->
      <section class="py-16 bg-gray-50">
        <div class="container mx-auto px-4">
          <div class="text-center mb-12">
            <h2 class="text-3xl font-bold text-gray-800 mb-4">Por que escolher a HobbyBichos?</h2>
            <p class="text-gray-600 max-w-2xl mx-auto">
              Oferecemos muito mais do que uma simples loja online. Somos uma comunidade dedicada ao bem-estar dos seus pets.
            </p>
          </div>

          <div class="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div class="text-center">
              <div class="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <svg class="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                </svg>
              </div>
              <h3 class="font-semibold text-gray-800 mb-2">Qualidade Garantida</h3>
              <p class="text-sm text-gray-600">Produtos selecionados das melhores marcas do mercado</p>
            </div>

            <div class="text-center">
              <div class="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <svg class="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"/>
                </svg>
              </div>
              <h3 class="font-semibold text-gray-800 mb-2">Entrega Rápida</h3>
              <p class="text-sm text-gray-600">Entregamos em todo o Brasil com agilidade e segurança</p>
            </div>

            <div class="text-center">
              <div class="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <svg class="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192L5.636 18.364M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z"/>
                </svg>
              </div>
              <h3 class="font-semibold text-gray-800 mb-2">Suporte Especializado</h3>
              <p class="text-sm text-gray-600">Equipe especializada para tirar suas dúvidas</p>
            </div>

            <div class="text-center">
              <div class="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <svg class="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
                </svg>
              </div>
              <h3 class="font-semibold text-gray-800 mb-2">Preços Competitivos</h3>
              <p class="text-sm text-gray-600">Os melhores preços e promoções exclusivas</p>
            </div>
          </div>
        </div>
      </section>

      <!-- CTA Section -->
      <section class="py-16 bg-primary-yellow text-white">
        <div class="container mx-auto px-4 text-center">
          <h2 class="text-3xl font-bold mb-4">Pronto para cuidar melhor do seu pet?</h2>
          <p class="text-xl opacity-90 mb-8">Explore nosso catálogo e encontre tudo o que seu amigo peludo precisa</p>
          <a 
            routerLink="/products" 
            class="inline-block bg-white text-primary-yellow font-bold py-4 px-8 rounded-lg hover:bg-gray-100 transition-colors"
          >
            Ver Produtos
          </a>
        </div>
      </section>
    </div>
  `
})
export class AboutComponent {}
