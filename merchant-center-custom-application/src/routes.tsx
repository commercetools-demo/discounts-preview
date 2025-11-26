import type { ReactNode } from 'react';
import { Switch, Route } from 'react-router-dom';
import DiscountPreview from './components/discount-preview';
import { Providers } from './contexts';

type ApplicationRoutesProps = {
  children?: ReactNode;
};
const ApplicationRoutes = (_props: ApplicationRoutesProps) => {
  return (
    <Providers>
      <Switch>
        <Route>
          <DiscountPreview />
        </Route>
      </Switch>
    </Providers>
  );
};
ApplicationRoutes.displayName = 'ApplicationRoutes';

export default ApplicationRoutes;
