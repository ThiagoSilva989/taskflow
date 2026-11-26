
import { useEffect, useState } from 'react';
import {
  signIn,
  signUp,
  confirmSignUp,
  resetPassword,
  confirmResetPassword,
  getCurrentUser,
  signOut,
} from 'aws-amplify/auth';
import './auth.css';

export default function AuthGate({ children }) {
  const [authenticated, setAuthenticated] = useState(false);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    async function checkUser() {
      try {
        await getCurrentUser();
        setAuthenticated(true);
      } catch {
        setAuthenticated(false);
      } finally {
        setChecking(false);
      }
    }

    checkUser();
  }, []);

  async function handleLogout() {
    await signOut();
    setAuthenticated(false);
  }

  if (checking) {
    return <div className="auth-loading">Carregando TaskFlow...</div>;
  }

  if (!authenticated) {
    return <AuthScreen onAuthenticated={() => setAuthenticated(true)} />;
  }

  return (
    <div className="taskflow-authenticated">
      <div className="auth-session-bar">
        <span>Você está conectado ao TaskFlow</span>
        <button onClick={handleLogout}>Sair</button>
      </div>
      {children}
    </div>
  );
}

function AuthScreen({ onAuthenticated }) {
  const [mode, setMode] = useState('login');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [code, setCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  function changeMode(newMode) {
    setMode(newMode);
    setError('');
    setMessage('');
    setPassword('');
    setCode('');
    setNewPassword('');
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError('');
    setMessage('');
    setLoading(true);

    try {
      if (mode === 'login') {
        const result = await signIn({
          username: email.trim(),
          password,
        });

        if (result.isSignedIn) {
          onAuthenticated();
        } else {
          setMessage(
            'A autenticação exige uma etapa adicional. Verifique as configurações do Cognito.'
          );
        }
      }

      if (mode === 'register') {
        await signUp({
          username: email.trim(),
          password,
          options: {
            userAttributes: {
              email: email.trim(),
              name: name.trim(),
            },
          },
        });

        setMode('confirm');
        setMessage('Enviamos um código de confirmação para seu e-mail.');
      }

      if (mode === 'confirm') {
        await confirmSignUp({
          username: email.trim(),
          confirmationCode: code.trim(),
        });

        setMode('login');
        setMessage('Cadastro confirmado! Agora você pode entrar.');
      }

      if (mode === 'forgot') {
        await resetPassword({
          username: email.trim(),
        });

        setMode('reset');
        setMessage('Enviamos um código de recuperação para seu e-mail.');
      }

      if (mode === 'reset') {
        await confirmResetPassword({
          username: email.trim(),
          confirmationCode: code.trim(),
          newPassword,
        });

        setMode('login');
        setMessage('Senha alterada com sucesso! Faça login.');
      }
    } catch (err) {
      setError(err.message || 'Não foi possível concluir a operação.');
    } finally {
      setLoading(false);
    }
  }

  const titles = {
    login: 'Bem-vindo de volta!',
    register: 'Crie sua conta',
    confirm: 'Confirme seu e-mail',
    forgot: 'Recuperar senha',
    reset: 'Criar nova senha',
  };

  const descriptions = {
    login: 'Entre para acessar suas tarefas.',
    register: 'Preencha os dados para começar a usar o TaskFlow.',
    confirm: 'Digite o código que enviamos para seu e-mail.',
    forgot: 'Informe seu e-mail para receber o código de recuperação.',
    reset: 'Informe o código recebido e escolha uma nova senha.',
  };

  return (
    <main className="auth-page">
      <section className="auth-card">
        <div className="auth-brand">
          <div className="auth-logo">T</div>
          <span>TaskFlow</span>
        </div>

        <h1>{titles[mode]}</h1>
        <p className="auth-description">{descriptions[mode]}</p>

        <form onSubmit={handleSubmit}>
          {mode === 'register' && (
            <label>
              Nome completo
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Seu nome"
                required
              />
            </label>
          )}

          {['login', 'register', 'confirm', 'forgot', 'reset'].includes(mode) && (
            <label>
              E-mail
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="seu@email.com"
                required
                disabled={mode === 'confirm' || mode === 'reset'}
              />
            </label>
          )}

          {(mode === 'login' || mode === 'register') && (
            <label>
              Senha
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Digite sua senha"
                minLength={8}
                required
              />
            </label>
          )}

          {(mode === 'confirm' || mode === 'reset') && (
            <label>
              Código de confirmação
              <input
                type="text"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="Código recebido por e-mail"
                required
              />
            </label>
          )}

          {mode === 'reset' && (
            <label>
              Nova senha
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Digite sua nova senha"
                minLength={8}
                required
              />
            </label>
          )}

          {error && <div className="auth-error">{error}</div>}
          {message && <div className="auth-message">{message}</div>}

          <button className="auth-submit" type="submit" disabled={loading}>
            {loading ? 'Aguarde...' : {
              login: 'Entrar',
              register: 'Criar conta',
              confirm: 'Confirmar cadastro',
              forgot: 'Enviar código',
              reset: 'Alterar senha',
            }[mode]}
          </button>
        </form>

        <div className="auth-links">
          {mode === 'login' && (
            <>
              <button onClick={() => changeMode('forgot')}>
                Esqueci minha senha
              </button>
              <p>
                Ainda não tem conta?{' '}
                <button onClick={() => changeMode('register')}>
                  Cadastre-se
                </button>
              </p>
            </>
          )}

          {mode === 'register' && (
            <p>
              Já possui uma conta?{' '}
              <button onClick={() => changeMode('login')}>Entrar</button>
            </p>
          )}

          {mode === 'confirm' && (
            <button onClick={() => changeMode('login')}>
              Voltar para o login
            </button>
          )}

          {(mode === 'forgot' || mode === 'reset') && (
            <button onClick={() => changeMode('login')}>
              Voltar para o login
            </button>
          )}
        </div>
      </section>
    </main>
  );
}
