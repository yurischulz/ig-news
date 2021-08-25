import { FaGithub } from 'react-icons/fa';
import { FiX } from 'react-icons/fi';

import styles from './styles.module.scss';
import { theme } from '../../../../styles/_colors';

export function SignInButton() {
  const isUserLoggedIn = true;

  return isUserLoggedIn ? (
    <button
      type="button"
      className={styles.signInButton}
    >
      <FaGithub color={theme.colors.green_500} />
      Yuri Schulz
      <FiX color={theme.colors.gray_400} className={styles.closeIcon} />
    </button>
  ) : (
    <button
      type="button"
      className={styles.signInButton}
    >
      <FaGithub color={theme.colors.yellow_500} />
      Sign in with Github
    </button>
  )
}