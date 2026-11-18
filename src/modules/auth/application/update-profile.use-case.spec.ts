import { InvalidPhoneNumberError } from '../../../common/domain/errors/invalid-phone-number.error';
import { EmailAddress } from '../domain/email-address';
import { PhoneInUseError } from '../domain/errors/phone-in-use.error';
import { InMemoryUserRepository } from './testing/in-memory-user.repository';
import { UpdateProfileUseCase } from './update-profile.use-case';

describe('UpdateProfileUseCase', () => {
  let users: InMemoryUserRepository;
  let useCase: UpdateProfileUseCase;

  beforeEach(() => {
    users = new InMemoryUserRepository();
    useCase = new UpdateProfileUseCase(users);
  });

  it('normalizes the phone and records consent', async () => {
    const user = await users.createMember(EmailAddress.parse('a@x.com'), 'en');

    const updated = await useCase.execute(user.id, {
      name: '  Sara ',
      phone: '٠٥٠١٢٣٤٥٦٧',
      whatsappOptIn: true,
      locale: 'ar',
    });

    expect(updated).toMatchObject({
      name: 'Sara',
      phone: '+966501234567',
      whatsappOptIn: true,
      locale: 'ar',
    });
  });

  it('rejects an invalid phone', async () => {
    const user = await users.createMember(EmailAddress.parse('a@x.com'), 'en');

    await expect(useCase.execute(user.id, { phone: '123' })).rejects.toBeInstanceOf(
      InvalidPhoneNumberError,
    );
  });

  it("refuses another account's phone", async () => {
    const first = await users.createMember(EmailAddress.parse('a@x.com'), 'en');
    const second = await users.createMember(EmailAddress.parse('b@x.com'), 'en');
    await useCase.execute(first.id, { phone: '0501234567' });

    await expect(useCase.execute(second.id, { phone: '+966501234567' })).rejects.toBeInstanceOf(
      PhoneInUseError,
    );
  });
});
