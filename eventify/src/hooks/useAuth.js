import { useSelector, useDispatch } from 'react-redux';
import {
  login,
  logout,
  completeAuthCheck,
  updateUser,
} from '../store/slices/authSlice';

export function useAuth() {
  const dispatch = useDispatch();
  const { user, token, loading } = useSelector((state) => state.auth);

  const loginUser = (payload) => {
    dispatch(login(payload));
  };

  const logoutUser = () => {
    dispatch(logout());
  };

  const updateUserProfile = (payload) => {
    dispatch(updateUser(payload));
  };

  const finishAuthCheck = () => {
    dispatch(completeAuthCheck());
  };

  return {
    user,
    token,
    loading,
    login: loginUser,
    logout: logoutUser,
    updateUser: updateUserProfile,
    completeAuthCheck: finishAuthCheck,
  };
}
