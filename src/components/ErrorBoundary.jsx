import React from 'react';

// Textos propios de la barrera: es una clase (sin hooks) y puede saltar antes de que
// exista el idioma de la app, así que lleva su propio ES/EN y lo deduce sola.
const TEXTS = {
  ES: {
    moduleTitle: 'Este módulo ha tenido un problema',
    moduleBody: 'El resto de tu portal sigue funcionando. Puedes reintentar o eliminar este módulo con la papelera de arriba a la derecha.',
    retry: 'Reintentar',
    appTitle: 'Algo ha fallado',
    appBody: 'No se ha perdido nada de lo guardado en tu cuenta. Prueba a recargar la página.',
    reload: 'Recargar la página',
    draftTitle: '¿Sigue fallando?',
    draftBody: 'Puede que el borrador guardado en este navegador esté dañado. Descarga una copia por si acaso y, después, restablécelo.',
    backup: 'Descargar copia del borrador',
    reset: 'Restablecer borrador y recargar',
    resetConfirm: 'Se borrará el borrador guardado en este navegador (no tu cuenta ni tus portales publicados). ¿Continuar?',
  },
  EN: {
    moduleTitle: 'This module ran into a problem',
    moduleBody: 'The rest of your portal still works. You can retry, or delete this module with the trash icon at the top right.',
    retry: 'Retry',
    appTitle: 'Something went wrong',
    appBody: 'Nothing saved in your account was lost. Try reloading the page.',
    reload: 'Reload the page',
    draftTitle: 'Still failing?',
    draftBody: 'The draft saved in this browser may be damaged. Download a copy just in case, then reset it.',
    backup: 'Download a copy of the draft',
    reset: 'Reset draft and reload',
    resetConfirm: 'This deletes the draft saved in this browser (not your account or your published portals). Continue?',
  },
};

const DRAFT_KEY = 'brandPortalData';

function detectLang() {
  try {
    const saved = JSON.parse(localStorage.getItem(DRAFT_KEY) || 'null');
    if (saved && typeof saved.language === 'string') return saved.language.toUpperCase() === 'EN' ? 'EN' : 'ES';
  } catch { /* borrador ilegible: se usa el idioma del navegador */ }
  return (navigator.language || 'es').toLowerCase().startsWith('es') ? 'ES' : 'EN';
}

function downloadDraftBackup() {
  try {
    const raw = localStorage.getItem(DRAFT_KEY);
    if (!raw) return;
    const blob = new Blob([raw], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'brandbara-borrador-copia.json';
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  } catch (e) {
    console.error('BrandBara: no se pudo crear la copia del borrador', e);
  }
}

function resetDraftAndReload(confirmText) {
  if (!window.confirm(confirmText)) return;
  try { localStorage.removeItem(DRAFT_KEY); } catch { /* sin acceso al almacenamiento */ }
  window.location.reload();
}

/**
 * variant="module": protege UN módulo del lienzo; el resto de la página sigue viva.
 * variant="app":    última red de seguridad de toda la aplicación.
 * resetKey: al cambiar (p. ej. el contenido del módulo), la barrera se rearma sola.
 */
export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { error: null, resetKey: props.resetKey };
  }

  static getDerivedStateFromError(error) {
    return { error };
  }

  static getDerivedStateFromProps(props, state) {
    if (state.error && props.resetKey !== state.resetKey) return { error: null, resetKey: props.resetKey };
    if (props.resetKey !== state.resetKey) return { resetKey: props.resetKey };
    return null;
  }

  componentDidCatch(error, info) {
    console.error('BrandBara: error capturado por la barrera (' + (this.props.variant || 'module') + ')', error, info?.componentStack);
  }

  retry = () => this.setState({ error: null });

  render() {
    if (!this.state.error) return this.props.children;
    const tx = TEXTS[detectLang()];
    const dark = !!this.props.isDarkMode;

    if (this.props.variant === 'app') {
      return (
        <div role="alert" className="min-h-screen flex items-center justify-center p-6 bg-slate-50 text-slate-800">
          <div className="max-w-md w-full bg-white border border-slate-200 rounded-3xl shadow-sm p-8 text-center">
            <h1 className="text-2xl font-black tracking-tight mb-2">{tx.appTitle}</h1>
            <p className="text-slate-600 mb-6">{tx.appBody}</p>
            <button type="button" onClick={() => window.location.reload()} className="w-full px-5 py-3 rounded-xl bg-violet-600 hover:bg-violet-700 text-white font-bold transition-colors">
              {tx.reload}
            </button>
            <div className="mt-8 pt-6 border-t border-slate-200 text-left">
              <h2 className="font-bold mb-1">{tx.draftTitle}</h2>
              <p className="text-sm text-slate-600 mb-4">{tx.draftBody}</p>
              <div className="flex flex-col gap-2">
                <button type="button" onClick={downloadDraftBackup} className="px-4 py-2.5 rounded-xl border border-slate-300 hover:bg-slate-50 text-sm font-bold transition-colors">
                  {tx.backup}
                </button>
                <button type="button" onClick={() => resetDraftAndReload(tx.resetConfirm)} className="px-4 py-2.5 rounded-xl border border-rose-300 text-rose-700 hover:bg-rose-50 text-sm font-bold transition-colors">
                  {tx.reset}
                </button>
              </div>
            </div>
          </div>
        </div>
      );
    }

    return (
      <div role="alert" className={`p-8 md:p-12 text-center ${dark ? 'text-slate-200' : 'text-slate-700'}`}>
        <div className={`max-w-lg mx-auto rounded-2xl border border-dashed p-6 ${dark ? 'border-white/20 bg-white/5' : 'border-slate-300 bg-slate-50'}`}>
          <p className="font-bold mb-1">{tx.moduleTitle}</p>
          {!this.props.isPreview && <p className={`text-sm mb-4 ${dark ? 'text-slate-400' : 'text-slate-600'}`}>{tx.moduleBody}</p>}
          {!this.props.isPreview && (
            <button type="button" onClick={this.retry} className="px-4 py-2 rounded-xl bg-violet-600 hover:bg-violet-700 text-white text-sm font-bold transition-colors">
              {tx.retry}
            </button>
          )}
        </div>
      </div>
    );
  }
}
