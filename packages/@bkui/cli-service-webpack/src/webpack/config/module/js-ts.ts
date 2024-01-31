/*
* Tencent is pleased to support the open source community by making
* 蓝鲸智云PaaS平台社区版 (BlueKing PaaS Community Edition) available.
*
* Copyright (C) 2021 THL A29 Limited, a Tencent company.  All rights reserved.
*
* 蓝鲸智云PaaS平台社区版 (BlueKing PaaS Community Edition) is licensed under the MIT License.
*
* License for 蓝鲸智云PaaS平台社区版 (BlueKing PaaS Community Edition):
*
* ---------------------------------------------------
* Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated
* documentation files (the "Software"), to deal in the Software without restriction, including without limitation
* the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and
* to permit persons to whom the Software is furnished to do so, subject to the following conditions:
*
* The above copyright notice and this permission notice shall be included in all copies or substantial portions of
* the Software.
*
* THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO
* THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
* AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF
* CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS
* IN THE SOFTWARE.
*/

import type { IContext } from 'typings';
import Config from 'webpack-chain';

import {
  loaderChain,
  excludeNodeModules,
  genThreadLoader,
  genEsbuildLoader,
  genBabelLoader,
  genTsLoader,
} from '../../../lib/use-loader';
import {
  getAbsolutePath,
} from '../../../lib/util';

// 处理 js ts tsx
export default (config: Config, context: IContext) => {
  const jsRule = config.module
    .rule('js')
    .test(/\.m?js$/);
  const tsRule = config.module
    .rule('ts')
    .test(/\.m?ts$/);
  const jsxRule = config.module
    .rule('jsx')
    .test(/\.m?jsx$/);
  const tsxRule = config.module
    .rule('tsx')
    .test(/\.m?tsx$/);

  const commonLoaders: any[] = [
    {
      loaderFn: genThreadLoader,
      options: context.options,
    },
  ];

  // 是否解析 node_module
  if (!context.options.parseNodeModules) {
    commonLoaders.unshift(excludeNodeModules);
  }

  // js loader
  loaderChain(
    jsRule,
    [
      ...commonLoaders,
      {
        loaderFn: genEsbuildLoader,
        options: {
          loader: 'js',
        },
      },
    ],
  );

  // jsx loader
  loaderChain(
    jsxRule,
    [
      ...commonLoaders,
      genBabelLoader,
    ],
  );

  // ts loader
  loaderChain(
    tsRule,
    [
      ...commonLoaders,
      {
        loaderFn: genEsbuildLoader,
        options: {
          loader: 'ts',
          tsconfig: getAbsolutePath(context.workDir, context.options.tsconfig),
        },
      },
    ],
  );

  // tsx loader
  loaderChain(
    tsxRule,
    [
      ...commonLoaders,
      genBabelLoader,
      {
        loaderFn: genTsLoader,
        options: {
          appendTsxSuffixTo: ['\\.vue$'],
        },
      },
    ],
  );
};