'use strict';

customElements.define('compodoc-menu', class extends HTMLElement {
    constructor() {
        super();
        this.isNormalMode = this.getAttribute('mode') === 'normal';
    }

    connectedCallback() {
        this.render(this.isNormalMode);
    }

    render(isNormalMode) {
        let tp = lithtml.html(`
        <nav>
            <ul class="list">
                <li class="title">
                    <a href="index.html" data-type="index-link">Gestor de Incidencias · DI 0488</a>
                </li>

                <li class="divider"></li>
                ${ isNormalMode ? `<div id="book-search-input" role="search">
    <input type="text" placeholder="Type to search">
    <button type="button"
        class="search-input-clear"
        aria-label="Clear search"
        data-search-input-clear>&times;</button>
</div>
` : '' }
                <li class="chapter">
                    <a data-type="chapter-link" href="index.html"><span class="icon ion-ios-home"></span>Getting started</a>
                    <ul class="links">
                                <li class="link">
                                    <a href="overview.html" data-type="chapter-link">
                                        <span class="icon ion-ios-keypad"></span>Overview
                                    </a>
                                </li>

                            <li class="link">
                                <a href="index.html" data-type="chapter-link">
                                    <span class="icon ion-ios-paper"></span>
                                        README
                                </a>
                            </li>
                                <li class="link">
                                    <a href="architecture.html" data-type="chapter-link">
                                        <span class="icon ion-ios-git-branch"></span>Architecture
                                    </a>
                                </li>
                                <li class="link">
                                    <a href="dependencies.html" data-type="chapter-link">
                                        <span class="icon ion-ios-list"></span>Dependencies
                                    </a>
                                </li>
                                <li class="link">
                                    <a href="properties.html" data-type="chapter-link">
                                        <span class="icon ion-ios-apps"></span>Properties
                                    </a>
                                </li>

                    </ul>
                </li>
                    <li class="chapter">
                        <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ? 'data-bs-target="#components-links"' :
                            'data-bs-target="#xs-components-links"' }>
                            <span class="icon ion-md-cog"></span>
                            <span>Components</span>
                            <span class="icon ion-ios-arrow-down"></span>
                        </div>
                        <ul class="links collapse " ${ isNormalMode ? 'id="components-links"' : 'id="xs-components-links"' }>
                            <li class="link">
                                <a href="components/App.html" data-type="entity-link" >App</a>
                            </li>
                            <li class="link">
                                <a href="components/AyudaPage.html" data-type="entity-link" >AyudaPage</a>
                            </li>
                            <li class="link">
                                <a href="components/BrandPanelComponent.html" data-type="entity-link" >BrandPanelComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/CampoComponent.html" data-type="entity-link" >CampoComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/DashboardPage.html" data-type="entity-link" >DashboardPage</a>
                            </li>
                            <li class="link">
                                <a href="components/DataTableComponent.html" data-type="entity-link" >DataTableComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/DetallePage.html" data-type="entity-link" >DetallePage</a>
                            </li>
                            <li class="link">
                                <a href="components/GraficoEstadosComponent.html" data-type="entity-link" >GraficoEstadosComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/HeaderComponent.html" data-type="entity-link" >HeaderComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/ListadoPage.html" data-type="entity-link" >ListadoPage</a>
                            </li>
                            <li class="link">
                                <a href="components/LoginPage.html" data-type="entity-link" >LoginPage</a>
                            </li>
                            <li class="link">
                                <a href="components/NuevaPage.html" data-type="entity-link" >NuevaPage</a>
                            </li>
                            <li class="link">
                                <a href="components/RegistroPage.html" data-type="entity-link" >RegistroPage</a>
                            </li>
                            <li class="link">
                                <a href="components/ShellComponent.html" data-type="entity-link" >ShellComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/StatCardComponent.html" data-type="entity-link" >StatCardComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/TabBarComponent.html" data-type="entity-link" >TabBarComponent</a>
                            </li>
                        </ul>
                    </li>
                        <li class="chapter">
                            <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ? 'data-bs-target="#injectables-links"' :
                                'data-bs-target="#xs-injectables-links"' }>
                                <span class="icon ion-md-arrow-round-down"></span>
                                <span>Injectables</span>
                                <span class="icon ion-ios-arrow-down"></span>
                            </div>
                            <ul class="links collapse " ${ isNormalMode ? 'id="injectables-links"' : 'id="xs-injectables-links"' }>
                                <li class="link">
                                    <a href="injectables/AuthService.html" data-type="entity-link" >AuthService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/ExportService.html" data-type="entity-link" >ExportService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/NosqlService.html" data-type="entity-link" >NosqlService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/NotificacionService.html" data-type="entity-link" >NotificacionService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/SqlService.html" data-type="entity-link" >SqlService</a>
                                </li>
                            </ul>
                        </li>
                    <li class="chapter">
                        <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ? 'data-bs-target="#guards-links"' :
                            'data-bs-target="#xs-guards-links"' }>
                            <span class="icon ion-ios-lock"></span>
                            <span>Guards</span>
                            <span class="icon ion-ios-arrow-down"></span>
                        </div>
                        <ul class="links collapse " ${ isNormalMode ? 'id="guards-links"' : 'id="xs-guards-links"' }>
                            <li class="link">
                                <a href="guards/adminGuard.html" data-type="entity-link" >adminGuard</a>
                            </li>
                            <li class="link">
                                <a href="guards/authGuard.html" data-type="entity-link" >authGuard</a>
                            </li>
                            <li class="link">
                                <a href="guards/guestGuard.html" data-type="entity-link" >guestGuard</a>
                            </li>
                        </ul>
                    </li>
                    <li class="chapter">
                        <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ? 'data-bs-target="#interfaces-links"' :
                            'data-bs-target="#xs-interfaces-links"' }>
                            <span class="icon ion-md-information-circle-outline"></span>
                            <span>Interfaces</span>
                            <span class="icon ion-ios-arrow-down"></span>
                        </div>
                        <ul class="links collapse " ${ isNormalMode ? ' id="interfaces-links"' : 'id="xs-interfaces-links"' }>
                            <li class="link">
                                <a href="interfaces/Actividad.html" data-type="entity-link" >Actividad</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/CredencialDemo.html" data-type="entity-link" >CredencialDemo</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/EnlaceTab.html" data-type="entity-link" >EnlaceTab</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/Estadisticas.html" data-type="entity-link" >Estadisticas</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/Incidencia.html" data-type="entity-link" >Incidencia</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/IndicadorPanel.html" data-type="entity-link" >IndicadorPanel</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/NuevaIncidencia.html" data-type="entity-link" >NuevaIncidencia</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/NuevoEvento.html" data-type="entity-link" >NuevoEvento</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/NuevoUsuario.html" data-type="entity-link" >NuevoUsuario</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/OpcionCampo.html" data-type="entity-link" >OpcionCampo</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/OpcionFiltro.html" data-type="entity-link" >OpcionFiltro</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/Sesion.html" data-type="entity-link" >Sesion</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/Usuario.html" data-type="entity-link" >Usuario</a>
                            </li>
                        </ul>
                    </li>
                    <li class="chapter">
                        <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ? 'data-bs-target="#miscellaneous-links"'
                            : 'data-bs-target="#xs-miscellaneous-links"' }>
                            <span class="icon ion-ios-cube"></span>
                            <span>Miscellaneous</span>
                            <span class="icon ion-ios-arrow-down"></span>
                        </div>
                        <ul class="links collapse " ${ isNormalMode ? 'id="miscellaneous-links"' : 'id="xs-miscellaneous-links"' }>
                            <li class="link">
                                <a href="miscellaneous/functions.html" data-type="entity-link">Functions</a>
                            </li>
                            <li class="link">
                                <a href="miscellaneous/typealiases.html" data-type="entity-link">Type aliases</a>
                            </li>
                            <li class="link">
                                <a href="miscellaneous/variables.html" data-type="entity-link">Variables</a>
                            </li>
                        </ul>
                    </li>
                        <li class="chapter">
                            <a data-type="chapter-link" href="routes.html"><span class="icon ion-ios-git-branch"></span>Routes</a>
                        </li>
                    <li class="chapter">
                        <a data-type="chapter-link" href="coverage.html"><span class="icon ion-ios-stats"></span>Documentation coverage</a>
                    </li>
            </ul>
        </nav>
        `);
        this.innerHTML = tp.strings;
    }
});
