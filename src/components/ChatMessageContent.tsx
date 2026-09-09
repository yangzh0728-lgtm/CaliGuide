import { Fragment } from 'react';
import { formatChatMessage, type ChatInline } from '../lib/chatMessageFormat';

interface ChatMessageContentProps {
  content: string;
}

function renderInlines(inlines: ChatInline[]) {
  return inlines.map((inline, index) =>
    inline.type === 'bold' ? (
      <strong key={index} className="font-semibold">
        {inline.text}
      </strong>
    ) : (
      <Fragment key={index}>{inline.text}</Fragment>
    ),
  );
}

export default function ChatMessageContent({ content }: ChatMessageContentProps) {
  const blocks = formatChatMessage(content);

  if (!blocks.length) {
    return null;
  }

  return (
    <div className="flex flex-col gap-2 text-sm leading-relaxed">
      {blocks.map((block, index) => {
        if (block.type === 'paragraph') {
          return <p key={index}>{renderInlines(block.inlines)}</p>;
        }

        const ListTag = block.ordered ? 'ol' : 'ul';

        return (
          <ListTag
            key={index}
            className={`flex flex-col gap-1 pl-5 ${
              block.ordered ? 'list-decimal' : 'list-disc'
            }`}
          >
            {block.items.map((item, itemIndex) => (
              <li key={itemIndex} className="pl-0.5">
                {renderInlines(item)}
              </li>
            ))}
          </ListTag>
        );
      })}
    </div>
  );
}
