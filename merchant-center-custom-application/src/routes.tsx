import type { ReactNode } from 'react';
import { Switch, Route } from 'react-router-dom';
import DiscountPreview from './components/discount-preview';
import {
  AutoDiscountsProvider,
  CurrentCartProvider,
  CurrentUserProvider,
} from './contexts';

type ApplicationRoutesProps = {
  children?: ReactNode;
};
const ApplicationRoutes = (_props: ApplicationRoutesProps) => {
  return (
    <CurrentUserProvider>
      <CurrentCartProvider>
        <AutoDiscountsProvider>
          <Switch>
            <Route>
              <DiscountPreview />
            </Route>
          </Switch>
        </AutoDiscountsProvider>
      </CurrentCartProvider>
    </CurrentUserProvider>
  );
};
ApplicationRoutes.displayName = 'ApplicationRoutes';

export default ApplicationRoutes;
