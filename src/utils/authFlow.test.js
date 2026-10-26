import test from 'node:test';
import assert from 'node:assert/strict';
import { isValidEmail, authErrorKind, readAuthRedirectError, redirectErrorKind, stripAuthRedirectError } from './authFlow.js';

test('isValidEmail acepta correos normales y rechaza basura', () => {
  assert.equal(isValidEmail('ana@ejemplo.com'), true);
  assert.equal(isValidEmail('  ana.lopez+beta@sub.ejemplo.es '), true);
  for (const bad of ['', 'ana', 'ana@', '@ejemplo.com', 'ana@ejemplo', 'ana @ejemplo.com', null, undefined]) {
    assert.equal(isValidEmail(bad), false, `debería rechazar ${JSON.stringify(bad)}`);
  }
});

test('authErrorKind clasifica los errores de Supabase', () => {
  assert.equal(authErrorKind(null), null);
  assert.equal(authErrorKind({ status: 429, message: 'x' }), 'rate');
  assert.equal(authErrorKind({ message: 'For security purposes, you can only request this after 49 seconds.' }), 'rate');
  assert.equal(authErrorKind({ code: 'over_email_send_rate_limit', message: 'email rate limit exceeded' }), 'rate');
  assert.equal(authErrorKind({ code: 'email_address_not_authorized', message: 'Email address not authorized' }), 'notAuthorized');
  assert.equal(authErrorKind({ message: 'Email address "x@y" is invalid' }), 'email');
  assert.equal(authErrorKind({ code: 'email_address_invalid', message: 'x' }), 'email');
  assert.equal(authErrorKind({ name: 'AuthRetryableFetchError', message: 'Failed to fetch' }), 'network');
  assert.equal(authErrorKind({ message: 'algo raro' }), 'generic');
});

test('readAuthRedirectError lee el error de la dirección (hash o query) y no inventa ninguno', () => {
  assert.equal(readAuthRedirectError({ search: '', hash: '' }), null);
  assert.equal(readAuthRedirectError({ search: '?foo=1', hash: '#bar=2' }), null);
  assert.equal(readAuthRedirectError(null), null);
  assert.deepEqual(
    readAuthRedirectError({ search: '', hash: '#error=access_denied&error_code=otp_expired&error_description=Email+link+is+invalid+or+has+expired' }),
    { error: 'access_denied', code: 'otp_expired' },
  );
  assert.deepEqual(readAuthRedirectError({ search: '?error=server_error&error_code=unexpected_failure', hash: '' }), { error: 'server_error', code: 'unexpected_failure' });
  // un token válido de vuelta NO es un error
  assert.equal(readAuthRedirectError({ search: '', hash: '#access_token=abc&refresh_token=def&type=magiclink' }), null);
});

test('redirectErrorKind distingue enlace caducado, cancelado y otros', () => {
  assert.equal(redirectErrorKind(null), null);
  assert.equal(redirectErrorKind({ error: 'access_denied', code: 'otp_expired' }), 'expired');
  assert.equal(redirectErrorKind({ error: 'access_denied', code: '' }), 'cancelled');
  assert.equal(redirectErrorKind({ error: 'server_error', code: 'unexpected_failure' }), 'generic');
});

test('stripAuthRedirectError deja solo la ruta', () => {
  assert.equal(stripAuthRedirectError({ pathname: '/mi-marca/edit', search: '?error=x', hash: '#error=y' }), '/mi-marca/edit');
  assert.equal(stripAuthRedirectError({ pathname: '', search: '', hash: '' }), '/');
});
