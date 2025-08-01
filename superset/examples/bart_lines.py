# Licensed to the Apache Software Foundation (ASF) under one
# or more contributor license agreements.  See the NOTICE file
# distributed with this work for additional information
# regarding copyright ownership.  The ASF licenses this file
# to you under the Apache License, Version 2.0 (the
# "License"); you may not use this file except in compliance
# with the License.  You may obtain a copy of the License at
#
#   http://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing,
# software distributed under the License is distributed on an
# "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
# KIND, either express or implied.  See the License for the
# specific language governing permissions and limitations
# under the License.
import logging

import polyline
from sqlalchemy import inspect, String, Text

from superset import db
from superset.sql.parse import Table
from superset.utils import json

from ..utils.database import get_example_database  # noqa: TID252
from .helpers import get_table_connector_registry, read_example_data

logger = logging.getLogger(__name__)


def load_bart_lines(only_metadata: bool = False, force: bool = False) -> None:
    tbl_name = "bart_lines"
    database = get_example_database()
    with database.get_sqla_engine() as engine:
        schema = inspect(engine).default_schema_name
        table_exists = database.has_table(Table(tbl_name, schema))

        if not only_metadata and (not table_exists or force):
            df = read_example_data(
                "examples://bart-lines.json.gz", encoding="latin-1", compression="gzip"
            )
            df["path_json"] = df.path.map(json.dumps)
            df["polyline"] = df.path.map(polyline.encode)
            del df["path"]

            df.to_sql(
                tbl_name,
                engine,
                schema=schema,
                if_exists="replace",
                chunksize=500,
                dtype={
                    "color": String(255),
                    "name": String(255),
                    "polyline": Text,
                    "path_json": Text,
                },
                index=False,
            )

    logger.debug(f"Creating table {tbl_name} reference")
    table = get_table_connector_registry()
    tbl = db.session.query(table).filter_by(table_name=tbl_name).first()
    if not tbl:
        tbl = table(table_name=tbl_name, schema=schema)
        db.session.add(tbl)
    tbl.description = "BART lines"
    tbl.database = database
    tbl.filter_select_enabled = True
    tbl.fetch_metadata()
