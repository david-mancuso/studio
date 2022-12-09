// This Source Code Form is subject to the terms of the Mozilla Public
// License, v2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/

import Logger from "@foxglove/log";
import { ILayoutStorage, Layout, LayoutID } from "@foxglove/studio-base/services/ILayoutStorage";

const log = Logger.getLogger(__filename);

/**
 * A wrapper around ILayoutStorage for a particular namespace.
 */
export class NamespacedLayoutStorage {
  private fromNamespace: string | undefined;
  public constructor(
    private storage: ILayoutStorage,
    private namespace: string,
    { importFromNamespace }: { importFromNamespace: string | undefined },
  ) {
    this.fromNamespace = importFromNamespace;
  }

  public async migrate(): Promise<void> {
    await this.storage
      .migrateUnnamespacedLayouts?.(this.namespace)
      .catch((error) => log.error("Migration failed:", error));

    if (this.fromNamespace != undefined) {
      await this.storage
        .importLayouts({ fromNamespace: this.fromNamespace, toNamespace: this.namespace })
        .catch((error) => log.error("Import failed:", error));
    }
  }

  public async list(): Promise<readonly Layout[]> {
    await this.migrate();
    return await this.storage.list(this.namespace);
  }
  public async get(id: LayoutID): Promise<Layout | undefined> {
    await this.migrate();
    return await this.storage.get(this.namespace, id);
  }
  public async put(layout: Layout): Promise<Layout> {
    await this.migrate();
    return await this.storage.put(this.namespace, layout);
  }
  public async delete(id: LayoutID): Promise<void> {
    await this.migrate();
    await this.storage.delete(this.namespace, id);
  }
}
