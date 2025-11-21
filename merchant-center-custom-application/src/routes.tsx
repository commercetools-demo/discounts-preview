import type { ReactNode } from 'react';
import { Switch, Route } from 'react-router-dom';
import DiscountPreview from './components/discount-preview';
import { CurrentCartProvider, CurrentUserProvider } from './contexts';

type ApplicationRoutesProps = {
  children?: ReactNode;
};
const ApplicationRoutes = (_props: ApplicationRoutesProps) => {
  return (
    <CurrentUserProvider>
      <CurrentCartProvider>
        <Switch>
          <Route>
            <DiscountPreview />
          </Route>
        </Switch>
      </CurrentCartProvider>
    </CurrentUserProvider>
  );
};
ApplicationRoutes.displayName = 'ApplicationRoutes';

export default ApplicationRoutes;
