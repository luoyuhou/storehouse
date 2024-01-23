class Utils {
  static getRandom(min: number, max: number) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  static flattenTree<T>(tree: T[], children: string, label: string) {
    const prefix = ["│", "├", "└"];
    const result: T[] = []; // 存放结果的数组

    function traverseNode(node: T[], level: number) {
      if (!node.length) {
        return;
      }

      node.forEach((item, index) => {
        const arr = new Array(level >= 1 ? level - 1 : 0).fill(prefix[0]);
        if (level > 0) {
          arr.push(index === node.length - 1 ? prefix[2] : prefix[1]);
        }

        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-expect-error
        result.push({ ...item, [label]: `${arr.join(" ")} ${item[label]}` });

        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-expect-error
        const child = item[children];
        if (child) {
          traverseNode(child, level + 1);
        }
      });
    }

    traverseNode(tree, 0);

    return result;
  }
}

export default Utils;
