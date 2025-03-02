export type TestUserInfo = {
  email: string;
  password: string;
  userId: string;
};

export function getTestUsers() {
  return {
    testAdmin1: {
      email: 'testadmin1@example.com',
      password: process.env.TEST_ADMIN_1_PW,
      userId: '50e97329-53b7-4834-b1f6-4b5ee7d2a091',
    },
    testMaintainer1: {
      email: 'testmaintainer1@example.com',
      password: process.env.TEST_MAINTAINER_1_PW,
      userId: '8ebdb5dd-88f0-4985-ab2f-0241c41c8498',
    },
    testMaintainer2: {
      email: 'testmaintainer2@example.com',
      password: process.env.TEST_MAINTAINER_2_PW,
      userId: 'b2c966ec-3969-449e-8371-65e46edf4557',
    },
    testRolelessUser: {
      email: 'testrolelessuser@example.com',
      password: process.env.TEST_ROLELESS_USER_PW,
      userId: 'a70f7a73-17e1-48bf-a028-a755a5cb804e',
    },
  } as {
    testAdmin1: TestUserInfo;
    testMaintainer1: TestUserInfo;
    testMaintainer2: TestUserInfo;
    testRolelessUser: TestUserInfo;
  };
}
