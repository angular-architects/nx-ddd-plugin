import { Injectable } from '@angular/core';
import { createEffect, Actions, ofType } from '@ngrx/effects';
import { catchError, map, switchMap } from 'rxjs/operators';
import { of } from 'rxjs';
import * as <%= classify(entity) %>Actions from './<%= dasherize(entity) %>.actions';
import { <%= classify(entity) %>DataService } from '../../infrastructure/<%= dasherize(entity) %>.data.service';

@Injectable()
export class <%= classify(entity) %>Effects {
  load<%= classify(entity) %>$ = createEffect(() =>
    this.actions$.pipe(
      ofType(<%= classify(entity) %>Actions.load<%= classify(entity) %>),
      switchMap((action) =>
        this.<%=camelize(entity)%>DataService.load().pipe(
          map((<%= camelize(entity) %>) =>
            <%= classify(entity) %>Actions.load<%= classify(entity) %>Success({ <%= camelize(entity) %> })
          ),
          catchError((error) =>
            of(<%= classify(entity) %>Actions.load<%= classify(entity) %>Failure({ error }))
          )
        )
      )
    )
  );

 constructor(
   private actions$: Actions,
   private <%=camelize(entity)%>DataService: <%= classify(entity) %>DataService
  ) { }
}
