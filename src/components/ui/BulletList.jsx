const BulletList = ({ items }) => (
  <ul className="mt-5 space-y-3 text-gray-700">
    {items.map((item) => (
      <li key={item} className="flex gap-3 leading-relaxed">
        <span className="mt-2 h-2 w-2 shrink-0 rounded-full bg-primary-600" aria-hidden="true" />
        <span>{item}</span>
      </li>
    ))}
  </ul>
);

export default BulletList;
