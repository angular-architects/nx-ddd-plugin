import { Injectable } from '@angular/core';
import { select, Store } from '@ngrx/store';

import { load<%=classify(entity)%> } from '../+state/<%= dasherize(entity) %>/<%= dasherize(entity) %>.actions';
import * as from<%= classify(entity) %> from '../+state/<%= dasherize(entity) %>/<%= dasherize(entity) %>.reducer';
import * as <%= classify(entity) %>Selectors from '../+state/<%= dasherize(entity) %>/<%= dasherize(entity) %>.selectors';

@Injectable({ providedIn: 'root' })
export class <%= classify(name) %>Facade {
  loaded$ = this.store.pipe(select(<%= classify(entity) %>Selectors.get<%= classify(entity) %>Loaded));
  <%= camelize(entity) %>List$ = this.store.pipe(select(<%= classify(entity) %>Selectors.getAll<%= classify(entity) %>));
  selected<%= classify(entity) %>$ = this.store.pipe(select(<%= classify(entity) %>Selectors.getSelected));

  constructor(private store: Store<from<%= classify(entity) %>.<%= classify(entity) %>PartialState>) { }

  load(): void {
    this.store.dispatch(load<%=classify(entity)%>());
  }
}
