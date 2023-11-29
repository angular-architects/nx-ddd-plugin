import { Meta, moduleMetadata, Story } from '@storybook/angular';
import { AsMilesTestComponent } from './test.component';

const Template: Story<AsMilesTestComponent> = (args: AsMilesTestComponent) => ({
  props: args,
  template: `<as-miles-test></as-miles-test>`,
});

export const MilesTest = Template.bind({});

export default {
  title: 'Miles Test',
  decorators: [
    moduleMetadata({
      imports: [AsMilesTestComponent],
    }),
  ],
  PARAMETERS: {
    docs: {
      description: {
        component: `The  Miles Test component is used to display a ‘Welcome’ message and the first name of the user.

                ## Import
                \`AsMilesTestComponent\` is a standalone component and can be imported directly from:
                \`import { AsMilesTestComponent } from '/miles/ui/test';\`

                ## Usage
                The header component can then be used without further configuration in the template:

                \`\`\`html
                <as-miles-test></as-miles-test>
                \`\`\`
                `,
      },
    },
    layout: 'padded',
  },
} as Meta<AsMilesTestComponent>;
